'use strict' 

const express = require('express'); 
const morgan = require('morgan'); 
const bodyParser = require("body-parser");
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


app.get('/ricette', async (req, res) => { 
	try {
	const allRic = await db.getAllRicette();
console.log(allRic);
	res.render('allRicette', {legends: allRic});
  } catch (err) {
	res.status(500).json({ message: err.message });
  }
});


app.get('/menu', async (req, res) => { 
	try {
	const menu = await db.getAllMenu();
console.log(menu);
	res.render('menu', {menu: menu});
  } catch (err) {
	res.status(500).json({ message: err.message });
  }
});

app.get('/piano/:id', async (req, res) => {
	try {
		const _id = req.params.id;
		console.log("questo e lid "+_id);

		const menus = await db.getMenuID(_id);
		res.render('piano', { menu: menus });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

app.get('/ingredienti', async (req, res) => { 
	try {
	const ingredienti = await db.getAllIngredienti();
	res.render('allIngredienti', {legends: ingredienti});
  } catch (err) {
	res.status(500).json({ message: err.message });
  }
});

app.get('/ingred', async (req, res) => { 
	try {
	const ingredienti = await db.getAllIngredienti();
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

app.post('/men', async (req, res) => {
	const allMen = await db.getAllMenu();
	res.json(allMen);
});

app.post('/pian', async (req, res) => {
	try {
		const menuId = req.body._id;
		const menuTrovato = await db.getMenuID(menuId);
		if (menuTrovato) {
			res.json(menuTrovato);
		} else {
			res.status(404).json({ message: "Menu non trovato" });
		}
	} catch (err) {
		console.error("Errore nel recupero del menu:", err);
		res.status(500).json({ message: err.message });
	}
});

app.post('/Nmenu', async (req, res) => {
	try {
		const nome = req.body.Name || 'Menu Generato';
		const temperaturaScelta = req.body.Temperatura;
		const candidati = await db.getRicetteTemp(temperaturaScelta);

	    const giorniSettimana = [
			"Luned&igrave;",
			"Marted&igrave;",
			"Mercoled&igrave;",
			"Gioved&igrave;",
			"Venerd&igrave;",
			"Sabato",
			"Domenica"
		];
		const giorniGenerati = [];
		const idUsati = new Set();

		// TODO
		const pesca = (orariAmmessi) => {
			const pool = candidati.filter(r =>
				orariAmmessi.includes(r.Orario) &&
				!idUsati.has(r._id.toString())
			);

			if (pool.length === 0) return null;

			const randIndex = Math.floor(Math.random() * pool.length);
			const scelta = pool[randIndex];
			idUsati.add(scelta._id.toString());
			return scelta._id; // Ritorno solo l'ID
		};

		for (let giorno of giorniSettimana) {
			const idPranzo = pesca([1, 3]);
			const idCena = pesca([2, 3]);

			if (idPranzo || idCena) {
				giorniGenerati.push({
					Nome: giorno,
					Pranzo: idPranzo,
					Cena: idCena
				});
			}
		}
		// fino a qui

		await db.insertMenu(nome, temperaturaScelta, giorniGenerati);

		const allMen = await db.getAllMenu();
		res.json(allMen);

	} catch (err) {
		console.error("Errore nella creazione menu:", err);
		res.status(500).json({ "error": "Impossibile creare il menu" });
	}
});

app.post('/Nricetta', async (req, res) => {
	try {
		const nome = req.body.Name || 'noName'; 
		const ingredienti = req.body.Ingredienti || 'noIngred'; 
		const temperatura = req.body.Temperatura; 
		const orario = req.body.Orario;
		await db.insertRicetta(nome, ingredienti, temperatura, orario); 
		const allRic = await db.getAllRicette();
		res.json(allRic); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.post('/NomeIngr', async (req, res) => { 
	const id = req.body.Id; 
	const ingred = await db.getIngredienteID(id);
	res.json(ingred);
});


app.post('/DELETETUTTOric', async (req, res) => { 
	try {
		await db.RimuoviTuttoRic();
		const allRic = await db.getAllRicette();
			res.json(allRic); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});
app.post('/DELETETUTTOmen', async (req, res) => { 
	try {
		await db.RimuoviTuttoMen();
		const allMen = await db.getAllMenu();
			res.json(allMen); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
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