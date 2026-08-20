# Liberar YouTube no backend do Render

O erro `error.api.youtube.login` ou `Sign in to confirm you’re not a bot` significa que o YouTube bloqueou o endereço IP do Render. A correção é fornecer cookies do YouTube ao yt-dlp do seu próprio backend.

## Recomendação de segurança

Use uma **conta secundária do Google/YouTube**, sem e-mails ou dados importantes. Cookies de sessão são sensíveis: quem tiver acesso a eles pode usar a sessão enquanto estiver válida. Nunca publique o arquivo no GitHub e nunca coloque seu conteúdo dentro do `index.html`.

## 1. Exportar em formato Netscape cookies.txt

1. Entre no YouTube pelo Chrome usando a conta secundária.
2. Use um exportador local e confiável de `cookies.txt` que gere o formato Netscape. Uma opção conhecida é a extensão de código aberto **Get cookies.txt LOCALLY**.
3. Estando em `youtube.com`, exporte os cookies.
4. Abra o arquivo e copie todo o conteúdo. A primeira linha normalmente contém:

```text
# Netscape HTTP Cookie File
```

5. Depois da exportação, você pode remover/desativar a extensão.

## 2. Adicionar como Secret File no Render

1. Abra o serviço `blind-engine-social-backend` no Render.
2. Acesse **Environment**.
3. Procure **Secret Files** e clique em **Add Secret File**.
4. Nome do arquivo:

```text
youtube-cookies.txt
```

5. Cole todo o conteúdo exportado no campo do arquivo.
6. Salve as alterações.
7. Faça **Manual Deploy > Deploy latest commit** ou aguarde o Render reiniciar o serviço.

O backend procura automaticamente em:

```text
/etc/secrets/youtube-cookies.txt
```

## 3. Confirmar no app

Na Aba 4, clique em **Testar e salvar backend**. A mensagem correta será:

```text
Cookies do YouTube: ativos ✅
```

Se voltar a aparecer pedido de login depois de alguns dias/semanas, os cookies expiraram. Exporte novamente e substitua o Secret File no Render.
