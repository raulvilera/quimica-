# Avaliação de Química — 3ª Série F

## Arquivos

- `index.html`: formulário atualizado com as 10 imagens didáticas em `assets/` e a lista da 3ª Série F.
- `Code.gs`: Google Apps Script atualizado para receber o POST e gravar as respostas na aba `Respostas`.
- `assets/`: imagens PNG correspondentes às questões 1 a 10.

## Publicação

1. Abra a planilha cujo ID está em `Code.gs` e confirme se ele é o correto.
2. No Apps Script, cole o conteúdo de `Code.gs` e autorize o projeto.
3. Publique em **Implantar > Nova implantação > Aplicativo da Web**.
4. Configure **Executar como: sua conta** e **Quem tem acesso: qualquer pessoa**.
5. Copie a URL `/exec` gerada e substitua `COLE_AQUI_A_URL_DO_WEB_APP_APPS_SCRIPT` em `index.html`.
6. Mantenha a pasta `assets` junto do HTML para que as imagens sejam carregadas.

O Apps Script cria a aba `Respostas` automaticamente se ela ainda não existir, mantém o cabeçalho congelado e aplica cores às respostas objetivas conforme o gabarito.

## Atualização do Apps Script e critérios de correção

O arquivo `Code.gs` agora cria ou migra a aba `Respostas` para 31 colunas, sem apagar registros existentes. Além das respostas, o cabeçalho passa a registrar:

- acertos nas 7 questões objetivas e resultado individual de cada questão;
- notas de Q8, Q9 e Q10;
- nota final de 0 a 10;
- status da correção;
- critério/banda da rubrica e feedback da IA para cada questão dissertativa.

### Aplicação no Apps Script

1. Abra o projeto do Apps Script vinculado à planilha.
2. Substitua o conteúdo de `Code.gs` pelo arquivo deste repositório.
3. Salve e execute uma vez `ATUALIZAR_ESTRUTURA_DA_PLANILHA` para criar os novos cabeçalhos na aba `Respostas`.
4. Se for usar a correção automática, configure `GEMINI_API_KEY` pelas propriedades do script executando `CONFIGURAR_CHAVE_GEMINI` uma vez.
5. Em **Implantar > Gerenciar implantações**, atualize a implantação do Web App para a nova versão.

A função `CORRIGIR_DISSERTATIVAS_AGORA` corrige em lote as respostas que ficarem com status `Aguardando correção manual`.
