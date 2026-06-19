# Backup antes da refatoração

Este backup foi criado antes da separação dos arquivos HTML, CSS e JS.

## Objetivo da refatoração

Organizar o frontend em:

- css/
- js/

Separando:
- estilos globais
- configuração da API
- funções de autenticação
- chamadas da API
- scripts do dashboard
- scripts do histórico
- scripts da tela principal

## Como restaurar

1. Localize o arquivo em:

backups/backup-antes-refatoracao-YYYYMMDD-HHMMSS.zip

2. Extraia em uma pasta separada.

3. Compare os arquivos ou substitua os arquivos atuais.

## Comando usado para criar backup

zip -r backups/backup-antes-refatoracao-DATA.zip . -x "node_modules/*" "backend/node_modules/*" "dist/*" "backups/*" ".git/*"

## Data

Criado antes da refatoração estrutural do frontend.
