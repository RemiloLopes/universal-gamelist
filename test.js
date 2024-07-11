var PORT = 8080; // Escolha uma porta disponível
const express = require('express');
const path = require('path');
const app = express();

app.use('/static', express.static(path.join(__dirname, 'public')))
app.set('view engine', 'jade')

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });

app.get('/', function (req, res) {
    res.render('test', { title: 'Andou na prancha'});
});

