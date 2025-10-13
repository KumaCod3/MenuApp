'use strict' 

const express = require('express'); 
const morgan = require('morgan'); 
const bodyParser = require("body-parser");
const DBAbstraction = require('./DBAbstraction'); 
const DBmenu = require('./DBmenu'); 
const db = new DBmenu();

const app = express(); 
const handlebars = require('express-handlebars').create({defaultLayout: 'main'});


app.use(express.json());
app.use(morgan('dev')); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('handlebars', handlebars.engine); 
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 


app.get('/menu', async (req, res) => { 
    try {
    const allRic = await db.getAllRicette();
console.log(allRic);
    res.render('allRicette', {legends: allRic});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/ingredienti', async (req, res) => { 
    try {
    const ingredienti = await db.getAllIngredienti();
	//console.log(ingredienti);
    res.render('allIngredienti', {legends: ingredienti});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/ingred', async (req, res) => { 
    try {
    const ingredienti = await db.getAllIngredienti();
	//console.log("presi"+ingredienti);
    res.json(ingredienti);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/Ningrediente', async (req, res) => {
	try {
		const nome = req.body.Name || 'noName'; 
		const prezzo = req.body.Price || 0; 
		await db.insertIngrediente(nome, prezzo); 
	 
		const allIngr = await db.getAllIngredienti();
		res.json(allIngr); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
}); 

app.post('/DELETEingredient', async (req, res) => { 
	const Name = req.body.Name; 
 
	await db.removeSingleIngredient(Name);
	const allInged = await db.getAllIngredienti();
	res.json(allInged);
});

app.post('/DELETERicetta', async (req, res) => { 
	const Name = req.body.Name; 
 
	await db.removeSingleRecepit(Name);
	const allRic = await db.getAllRicette();
	res.json(allRic);
});

app.post('/ricet', async (req, res) => { 
	const allRic = await db.getAllRicette();
	res.json(allRic);
});

app.post('/Nricetta', async (req, res) => {
	try {
		const nome = req.body.Name || 'noName'; 
		const ingredienti = req.body.Ingredienti || 'noIngred'; 
		const temperatura = req.body.Temperatura; 
		const orario = req.body.Orario;
		//console.log("nuovaricetta: "+nome+ingredienti+temperatura+orario);
		await db.insertRicetta(nome, ingredienti, temperatura, orario); 
		const allRic = await db.getAllRicette();
		res.json(allRic); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
}); 

app.post('/NomeIngr', async (req, res) => { 
	const id = req.body.Id; 
console.log('INDEX cerco ID:', id);
	const ingred = await db.getIngredienteID(id);
	res.json(ingred);
});



















app.use((req, res) => { 
    res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`); 
}); 
 
db.init()
    .then(() => { 
        app.listen(53140, () => console.log('The server is up and running...')); 
    }) 
    .catch(err => { 
        console.log('Problem setting up the database'); 
        console.log(err); 
    });
// Gestione della chiusura del processo per disconnettersi da MongoDB
process.on('SIGINT', async () => {
    console.log('Chiusura del server...');
    await db.close();
    process.exit(0);
});