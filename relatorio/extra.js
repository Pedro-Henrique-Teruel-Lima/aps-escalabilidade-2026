// extra.js — bibliografia e ficha de APS
const refs = [
  'AMDAHL, G. M. Validity of the single processor approach to achieving large scale computing capabilities. In: AFIPS SPRING JOINT COMPUTER CONFERENCE, 1967, Atlantic City. **Proceedings** [...]. New York: ACM, 1967. p. 483-485.',
  'COULOURIS, G. et al. **Sistemas distribuídos**: conceitos e projeto. 5. ed. Porto Alegre: Bookman, 2013.',
  'GILBERT, S.; LYNCH, N. Brewer’s conjecture and the feasibility of consistent, available, partition-tolerant web services. **ACM SIGACT News**, New York, v. 33, n. 2, p. 51-59, 2002.',
  'GRAFANA LABS. **k6 documentation**. [S. l.]: Grafana Labs, [s.d.]. Disponível em: https://grafana.com/docs/k6/. Acesso em: ___ /___ /2026.',
  'HAPROXY TECHNOLOGIES. **HAProxy documentation**. [S. l.]: HAProxy Technologies, [s.d.]. Disponível em: https://docs.haproxy.org/. Acesso em: ___ /___ /2026.',
  'KLEPPMANN, M. **Designing data-intensive applications**: the big ideas behind reliable, scalable, and maintainable systems. Sebastopol: O’Reilly Media, 2017.',
  'LITTLE, J. D. C. A proof for the queuing formula: L = λW. **Operations Research**, Catonsville, v. 9, n. 3, p. 383-387, 1961.',
  'MASTERSON, J. M.; RICHARDSON, F. A. **Humidex**: a method of quantifying human discomfort due to excessive heat and humidity. Downsview: Environment Canada, Atmospheric Environment Service, 1979. (CLI 1-79).',
  'NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY. **FIPS PUB 180-4**: secure hash standard (SHS). Gaithersburg: NIST, 2015.',
  'POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL 16 documentation**: high availability, load balancing, and replication. [S. l.]: PostgreSQL Global Development Group, [s.d.]. Disponível em: https://www.postgresql.org/docs/16/high-availability.html. Acesso em: ___ /___ /2026.',
  'REDIS LTD. **Redis documentation**. [S. l.]: Redis Ltd., [s.d.]. Disponível em: https://redis.io/docs/. Acesso em: ___ /___ /2026.',
  'SCHROEDER, B.; WIERMAN, A.; HARCHOL-BALTER, M. Open versus closed: a cautionary tale. In: SYMPOSIUM ON NETWORKED SYSTEMS DESIGN AND IMPLEMENTATION, 3., 2006, San Jose. **Proceedings** [...]. Berkeley: USENIX Association, 2006. p. 239-252.',
  'TANENBAUM, A. S.; VAN STEEN, M. **Sistemas distribuídos**: princípios e paradigmas. 2. ed. São Paulo: Pearson Prentice Hall, 2007.',
  'UNIVERSIDADE PAULISTA. **Atividades práticas supervisionadas**: orientações para a disciplina, 7º e 8º semestres de Ciência da Computação, 2026/2. Araraquara: UNIP, 2026.',
  'VOGELS, W. Eventually consistent. **Communications of the ACM**, New York, v. 52, n. 1, p. 40-44, 2009.',
];

const extra = [
  { t: 'h1', x: '8 BIBLIOGRAFIA' },
  { t: 'refs', x: refs },
  { t: 'h1', x: '9 FICHA DE ATIVIDADES PRÁTICAS SUPERVISIONADAS' },
  { t: 'ficha' },
];

module.exports = { extra };
