# Matriz comparativa de testes — APS 2026/2

Carga: k6 em taxa de chegada, `WRITE_RATE=4`, `READ_RATE=50`, `PEAK_FACTOR=3`, `PEAK_START=30`, lotes de 10 a 60 medições, duração ≈ 145 s, três picos.
Fonte: `codes/resultados/*/report.json`, `resultado_registros.txt` e `docker_stats_*.csv` (amostragem de `docker stats` a cada ~1 s durante a rodada inteira).

## Tabela 1 — Matriz oficial (Cenário A × Cenário B)

| Métrica | Cenário A (baseline) | Cenário B (distribuído, master/slave) |
|---|---|---|
| Vazão total (req/s completadas) | 73,57 | 78,59 |
| Vazão útil (req/s com sucesso) | 27,57 | 78,59 |
| Taxa de sucesso das requisições | 37,47 % | 100,00 % |
| POST /telemetria aceitos | 249 / 826 (30,2 %) | 844 / 844 (100 %) |
| GET /indice-calor válidos (2xx ou 404) | 3.748 / 9.842 (38,1 %) | 10.551 / 10.551 (100 %) |
| Iterações descartadas pelo k6 | 726 | 0 |
| Medições enviadas | 28.797 | 29.149 |
| Medições gravadas | 8.233 | 29.149 |
| Medições perdidas | 20.564 | 0 |
| **Taxa de persistência (gravados ÷ enviados)** | **28,59 %** | **100,00 %** |
| Divergentes / Fantasmas / Duplicatas | 0 / 0 / 0 | 0 / 0 / 0 |
| Nota (10 × taxa de persistência) | 2,86 | 10,00 |
| Registros gravados por segundo | 56,8 | 201,0 |
| p95 da latência (ms) | 5.001 (timeout) | 75,9 |
| CPU alocada (soma de limits.cpus) | 0,85 ¹ | 0,79 |
| **Índice de Eficiência de Vazão (IEV)** ² | **32,4** | **99,5** |

¹ O `docker-compose.monolito.yaml` entregue na pasta `codes` dá 0,8 CPU ao Postgres (0,05 à aplicação). O PDF (Anexo D.6) indica 0,08. Usamos o valor do arquivo, que dá mais CPU ao Cenário A do que o PDF prevê; com os 0,08 do PDF o banco do baseline teria menos CPU. Não rodamos essa variante, então não afirmamos o efeito dela sobre a persistência.
² O PDF cita o IEV mas não fornece a fórmula. Definição adotada pelo grupo: **IEV = vazão útil (req/s com sucesso) ÷ CPU total alocada (vCPU)**. Deve ser confirmada com o professor.

## Tabela 2 — Topologias internas do Cenário B (documentadas no relatório)

| Métrica | B v1 (sem réplica) | B v2 (com master/slave) |
|---|---|---|
| Instâncias ingest / leitura | 5 / 2 | 3 / 2 |
| Postgres | 1 × 0,25 | master 0,20 + réplica 0,15 |
| Medições gravadas / enviadas | 29.610 / 29.610 | 29.149 / 29.149 |
| Taxa de persistência | 100,00 % | 100,00 % |
| Vazão útil (req/s) | 78,57 | 78,59 |
| p95 (ms) | 89,6 | 75,9 |
| IEV | 99,5 | 99,5 |
| Pico de CPU do Postgres master | 25,0 % de 25 % (saturado) | 19,5 % de 20 % |

Observação: ambas as versões tiveram 100 % em uma rodada cada (e a v1 repetiu o resultado em outra rodada anterior, sem stats). Com uma rodada por versão, não há evidência estatística de que uma supere a outra em persistência; a diferença visível está no uso de CPU e na latência.

## Tabela 3 — Pico de CPU por serviço (`docker stats`, % de 1 vCPU)

| Serviço | Limite | Cenário A | B v1 | B v2 |
|---|---|---|---|---|
| Aplicação (monolito) | 5 % | 5,6 % | — | — |
| Postgres (A: 80 %; B v1: 25 %; B v2 master: 20 %) | — | 50,7 % | 25,0 % | 19,5 % |
| Postgres réplica | 15 % | — | — | 12,3 % |
| HAProxy | 8 % | — | 7,7 % | 7,2 % |
| Ingest (por instância) | 5 % | — | 4,3 % | 4,7 % |
| Leitura (por instância) | 5 % | — | 5,7 % | 5,2 % |
| Redis | 5 % | — | 4,9 % | 4,2 % |
| Worker | 5 % | — | 3,4 % | 3,2 % |

Observações: valores acima do limite em 5,6–5,7 % vêm da granularidade da amostragem do `docker stats`. A linha do Postgres do Cenário A mostra 50,7 % porque o compose da pasta lhe dá 0,8 CPU.

## Tabela 4 — Orçamento de CPU do Cenário B (v2)

| Serviço | Instâncias × cota | CPU |
|---|---|---|
| haproxy | 1 × 0,08 | 0,08 |
| redis | 1 × 0,05 | 0,05 |
| postgres (master) | 1 × 0,20 | 0,20 |
| postgres-replica | 1 × 0,15 | 0,15 |
| worker | 1 × 0,05 | 0,05 |
| ingest | 3 × 0,05 | 0,15 |
| leitura | 2 × 0,05 | 0,10 |
| db-init (roda uma vez) | 1 × 0,01 | 0,01 |
| **Total** | | **0,79** (teto 0,80) |

## Pendências para fechar a matriz

- Anexar as capturas de tela do `docker stats` (os CSVs em `codes/resultados/` guardam os dados brutos).
- Repetir cada cenário 2–3 vezes e usar a média, se o grupo quiser mais robustez.
- Confirmar com o professor a fórmula do IEV e o compose oficial do Cenário A.
