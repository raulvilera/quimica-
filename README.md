# Avaliação de Química — 3ª Série F

## Arquivos

- `avaliacao.html`: formulário atualizado com as 10 imagens didáticas em `assets/` e a lista da 3ª Série F.
- `Code.gs`: Google Apps Script atualizado para receber o POST e gravar as respostas na aba `Respostas`.
- `assets/`: imagens PNG correspondentes às questões 1 a 10.

## Publicação

1. Abra a planilha cujo ID está em `Code.gs` e confirme se ele é o correto.
2. No Apps Script, cole o conteúdo de `Code.gs` e autorize o projeto.
3. Publique em **Implantar > Nova implantação > Aplicativo da Web**.
4. Configure **Executar como: sua conta** e **Quem tem acesso: qualquer pessoa**.
5. Copie a URL `/exec` gerada e substitua `COLE_AQUI_A_URL_DO_WEB_APP_APPS_SCRIPT` em `avaliacao.html`.
6. Mantenha a pasta `assets` junto do HTML para que as imagens sejam carregadas.

O Apps Script cria a aba `Respostas` automaticamente se ela ainda não existir, mantém o cabeçalho congelado e aplica cores às respostas objetivas conforme o gabarito.
