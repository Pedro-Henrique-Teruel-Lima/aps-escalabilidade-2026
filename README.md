# APS 2026/2 — Escalabilidade horizontal vs. vertical sob restrição de recursos

Trabalho de Atividades Práticas Supervisionadas (7º/8º semestres de Ciência da Computação, UNIP Araraquara).

O objetivo é reprojetar um serviço de telemetria microclimática para absorver rajadas de carga **sem perder medições**, com no máximo 0,80 vCPU somadas e 0,05 vCPU por instância da aplicação.

## Resultado

| | Cenário A (monolito) | Cenário B (distribuído) |
|---|---|---|
| Medições gravadas | 8.233 de 28.797 | 29.149 de 29.149 |
| Taxa de persistência | 28,59% | 100% |
| Nota do avaliador | 2,86 | 10,00 |
| Requisições com sucesso | 37,5% | 100% |

Detalhes em [matriz_comparativa.md](matriz_comparativa.md).

## Arquitetura do Cenário B

```
k6 → haproxy:8080 (alias aps-app)
       ├─ POST /telemetria ──→ ingest ×3 ──→ Redis (fila) ──→ worker ──→ PostgreSQL mestre
       └─ GET /indice-calor, /audit/*, /health ──→ leitura ×2 ──→ PostgreSQL réplica
                                     mestre ── replicação por streaming ──→ réplica
```

- **ingest**: valida o lote, calcula SHA-256 e Humidex, enfileira e responde 202.
- **worker**: grava em lote no mestre (`INSERT … unnest … ON CONFLICT DO NOTHING`).
- **leitura**: `main.go` original do kit, lendo da réplica.
- Soma de `limits.cpus`: **0,79**. Toda a solução está em `codes/docker-compose.distribuido.yaml`; os arquivos do kit base não foram alterados.

## Como executar

Requisitos: Docker Desktop (ou Docker Engine com Compose).

```
cd codes
run_benchmark.bat        # Windows: roda os Cenários A e B
./run_benchmark.sh       # Linux
```

Para coletar também o `docker stats` durante a rodada (Windows PowerShell):

```
.\coletar_stats.ps1 A
.\coletar_stats.ps1 B
```

Os resultados ficam em `codes/resultados/`.

## Conteúdo

| Caminho | O que é |
|---|---|
| `codes/` | Kit base do professor e `docker-compose.distribuido.yaml` (Cenário B) |
| `codes/docker-compose.distribuido_v1_sem_replica.yaml` | Versão anterior do Cenário B, sem réplica, usada na comparação interna |
| `codes/resultados/` | Resultados das rodadas e amostras do `docker stats` |
| `coletar_stats.ps1` | Roda um cenário e amostra o `docker stats` |
| `matriz_comparativa.md` | Matriz comparativa de testes |
| `Relatorio_APS.docx` | Relatório técnico |
| `relatorio/` | Fontes que geram o relatório |

## Limitações conhecidas

- `synchronous_commit=off` no mestre: uma queda do banco pode perder as últimas transações.
- Se o worker cair entre retirar um lote da fila e gravá-lo, o lote é perdido.
- `total_persistido` na resposta do POST significa "aceito e enfileirado".
- Cada cenário foi medido em poucas rodadas.
