const mongoose = require('mongoose');

const ingredientiSchema = new mongoose.Schema({
	Name: { type: String, required: true },
	Price: { type: Number, required: true },
});
const Ingrediente = mongoose.model('Ingrediente', ingredientiSchema);

const ricettaSchema = new mongoose.Schema({
	Name: { type: String, required: true },
	Ingredienti: [{ type: mongoose.Types.ObjectId, ref: 'Ingrediente' }],
	Temperatura: { type: Number, required: true },
	Orario: { type: Number, required: true },
	Note: { type: String, required: false },
	Menus: [{ type: mongoose.Types.ObjectId, ref: 'Menu' }],
	Prova: { type: Boolean, required: true, default: false }
});
const Ricetta = mongoose.model('Ricetta', ricettaSchema);

const settimanaSchema = new mongoose.Schema({
	Name: { type: String, required: true },
	Temperatura: { type: Number, required: true },
	Giorni: [{
		Nome: { type: String },
		Pranzo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ricetta'
		},
		Cena: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ricetta'
		}
	}],
	Menu: { type: mongoose.Types.ObjectId, ref: 'Menu' }
});
const Settimana = mongoose.model('Settimana', settimanaSchema);

const menuSchema = new mongoose.Schema({
	Name: { type: String, required: true },
	Temperatura: { type: Number, required: true },
	Settimane: [{ type: mongoose.Types.ObjectId, ref: 'Settimana' }]
})
const Menu = mongoose.model('Menu', menuSchema);


class DBmenu {
	constructor() {
		this.dbUrl = 'mongodb://127.0.0.1:27017/menu';
	}

	async init() {
		try {
			await mongoose.connect(this.dbUrl, {
				serverSelectionTimeoutMS: 5000 // Timeout per la selezione del server
			});
			console.log('Connesso a MongoDB tramite Mongoose!');
		} catch (err) {
			console.error('Errore di connessione a MongoDB:', err);
			throw err;
		}
	}

	async getAllMenu() {
		let menus = [];
		try {
			menus = await Menu.find()
				.populate('Settimane')
				.lean(); // forse da togliere
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione delle settimane:', err);
			throw err;
		}
		return menus;
	}

	async getAllRicette() {
		let ricette = [];
		try {
			ricette = await Ricetta.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione delle ricette:', err);
			throw err;
		}
		return ricette;
	}

	async getAllRicetteJN() {
		let ricette = [];
		try {
			ricette = await Ricetta.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione delle ricette:', err);
			throw err;
		}
		return ricette;
	}

	async getAllIngredienti() {
		let ingredienti = [];
		try {
			ingredienti = await Ingrediente.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione degli ingredienti:', err);
			throw err;
		}
		return ingredienti;
	}

	async removeSingleIngredient(name) {
		let updatedItem = null;
		try {
			let item = await Ingrediente.findOneAndDelete({ 'Name': name });
			if (item == null) {
				return null;
			}
		} catch (err) {
			throw err;
		}
		return;
	}

	async removeSingleRecepit(name) {
		let updatedItem = null;
		console.log("Rimuovo: " + name);
		try {
			let item = await Ricetta.findOneAndDelete({ 'Name': name });
			if (item == null) {
				return null;
			}
		} catch (err) {
			console.error(err);
			throw err;
		}
		return;
	}

	async RimuoviTuttoRic() {
		try {
			await Ricetta.deleteMany({}); // per droppare tutte ricette!!!!
			return null;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
	async RimuoviTuttoMen() {
		try {
			await Settimana.deleteMany({}); // per droppare tutte ricette!!!!
			await Menu.deleteMany({}); // per droppare tutte ricette!!!!
			return null;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	async getAllIngredientiJN() {
		let ingredienti = [];
		try {
			ingredienti = await Ricetta.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione degli ingredienti:', err);
			throw err;
		}
		return ingredienti;
	}

	async insertRicetta(nome, ingred, temperatura, orario, prova) {
		let ingredArray = [];
		for (let i = 0; i < ingred.length; i++) {
			const nomeGiro = ingred[i];
			let ingredienti = nomeGiro.length > 0 ? nomeGiro : "noIng";

			let ingrediente = null;
			try {
				ingrediente = await Ingrediente.findById(ingredienti);
			} catch (err) {
				try {
					ingrediente = await Ingrediente.findOne({ Name: ingredienti });
				} catch (err) {
					console.error('C\'è stato un problema nel trovare la ingrediente:', err);
					throw err;
				}
			}
			if (ingrediente == null) {
				try {
					let newIngrediente = new Ingrediente({
						Name: ingredienti,
						Price: 0
					});
					await newIngrediente.save();
					ingrediente = newIngrediente;

				} catch (err) {
					console.error('C\'è stato un problema con l\'inserimento delingrediente:', err);
					throw err;
				}
			}
			ingredArray.push(ingrediente);
		}
		try {
			const newRicetta = new Ricetta({
				Name: nome,
				Ingredienti: ingredArray,
				Temperatura: temperatura,
				Orario: orario,
				Prova: prova
			});
			await newRicetta.save();
		} catch (err) {
			console.error("non e un ingrediente");
		}
	}

	async modificaRicetta(id, nome, ingred, temperatura, orario, prova) {
		let ingredArray = [];
		for (let i = 0; i < ingred.length; i++) {
			const nomeGiro = ingred[i];
			let ingredienti = nomeGiro.length > 0 ? nomeGiro : "noIng";

			let ingrediente = null;
			try {
				ingrediente = await Ingrediente.findById(ingredienti);
			} catch (err) {
				try {
					ingrediente = await Ingrediente.findOne({ Name: ingredienti });
				} catch (err) {
					console.error('C\'è stato un problema nel trovare la ingrediente:', err);
					throw err;
				}
			}
			if (ingrediente == null) {
				try {
					let newIngrediente = new Ingrediente({
						Name: ingredienti,
						Price: 0
					});
					await newIngrediente.save();
					ingrediente = newIngrediente;

				} catch (err) {
					console.error('C\'è stato un problema con l\'inserimento delingrediente:', err);
					throw err;
				}
			}
			ingredArray.push(ingrediente);
		}
		try {
			const updatedRicetta = await Ricetta.findByIdAndUpdate(
				id,
				{
					Name: nome,
					Ingredienti: ingredArray,
					Temperatura: temperatura,
					Orario: orario,
					Prova: prova
				},
				{ new: true } // questo restituisce il documento aggiornato
			);

			if (!updatedRicetta) {
				console.error("Ricetta non trovata " + id);
			} else {
				console.log("Ricetta aggiornata:", updatedRicetta);
				return updatedRicetta;
			}
		} catch (err) {
			console.error("Errore durante l'aggiornamento della ricetta:", err);
		}
	}

	async insertMenu(nome, temperatura) {
		let newMenu = null;
		try {
			newMenu = new Menu({
				Name: nome,
				Temperatura: temperatura,
				Settimane: []
			});
			await newMenu.save();

		} catch (err) {
			console.error('C\'è stato un problema con l\'inserimento del menu :', err);
			throw err;
		}
		await this.popolaMenu(newMenu);
		return newMenu;
	}

	async popolaMenu(newMenu) {
		const menID = newMenu._id;

		// Lista dei nomi per popolare il campo 'Nome'
		const nomiSettimana = [
			'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì',
			'Venerdì', 'Sabato', 'Domenica'
		];

		for (let i = 0; i < 4; i++) {
			const n = i + 1;

			// Creiamo l'array di oggetti seguendo esattamente il tuo schema
			const giorniDaInserire = nomiSettimana.map(giorno => ({
				Nome: giorno,
				Pranzo: null, // Riferimento ObjectId vuoto
				Cena: null    // Riferimento ObjectId vuoto
			}));

			try {
				const newSett = new Settimana({
					Name: `Settimana ${n}`,
					Temperatura: newMenu.Temperatura,
					Giorni: giorniDaInserire, // Inserimento dell'array strutturato
					Menu: menID
				});

				await newSett.save();
				newMenu.Settimane.push(newSett);
			} catch (err) {
				console.error(`Errore durante il salvataggio della Settimana ${n}:`, err);
				throw err;
			}
		}

		// Salviamo il menu con i riferimenti alle 4 settimane create
		await newMenu.save();
	}

	async insertIngrediente(nome, prezzo) {
		let newIngrediente = null;
		try {
			newIngrediente = new Ingrediente({
				Name: nome,
				Price: prezzo
			});
			await newIngrediente.save();

		} catch (err) {
			console.error('C\'è stato un problema con l\'inserimento delingrediente:', err);
			throw err;
		}
		return newIngrediente;
	}

	async getRicetteTemp(temp) {
		let ricette = [];
		if (!Number.isInteger(temp)) {
			return ricette;
		}

		try {
			ricette = await Ricetta.find({
				$or: [
					{ Temperatura: temp },
					{ Temperatura: 3 },
					{ Temperatura: 0 }
				]
			});
		} catch (err) {
			console.error('There was a problem finding the ricette' + err);
			throw err;
		}
		return ricette;
	}

	async getRicetteOra(ora) {
		let ricette = [];
		if (!Number.isInteger(temp)) {
			return ricette;
		}

		try {
			ricette = await Ricetta.find({ Orario: ora });
			console.log("array: " + ricette.length);
		} catch (err) {
			console.error('There was a problem finding the ricette' + err);
			throw err;
		}
		return ricette;
	}

	async getRicetta(nome) {
		let ricetta = null;
		try {
			ricetta = await Ricetta.findOne({ Name: nome });
		} catch (err) {
			console.error('C\'è stato un problema nel trovare la ricetta:', err);
			throw err;
		}
		return ricetta;
	}

	async removeIngRecepit(nome, id) {
		try {
			console.log("Cerco ricetta:" + nome + " con ID ingrediente:" + id);

			// Trova la ricetta per nome e rimuovi l'ingrediente specificato
			const updatedRicetta = await Ricetta.findOneAndUpdate(
				{ Name: nome },
				{ $pull: { Ingredienti: id } }, // Usa $pull per rimuovere l'ID dall'array
				{ new: true } // Restituisce il documento aggiornato
			);

			if (!updatedRicetta) {
				console.error("Ricetta non trovata");
				return null;
			}

			console.log("Ricetta aggiornata:", updatedRicetta);
			return updatedRicetta; // Restituisce la ricetta aggiornata
		} catch (err) {
			console.error('C\'è stato un problema nel rimuovere l\'ingrediente dalla ricetta:', err);
			throw err; // Rilancia l'errore
		}
	}

	async getRicettaID(_id) {
		let ricetta = null;
		try {
			ricetta = await Ricetta.findById(_id);
		} catch (err) {
			console.error('C\'è stato un problema nel trovare la ricetta:', err);
			throw err;
		}
		return ricetta;
	}

	async getIngrediente(nome) {
		let ingrediente = null;
		console.log("Almeno ci provo UN POCHINO???");
		try {
			ingrediente = await Ingrediente.findOne({ Name: nome });
			console.log('ingrediente trovata per nome:', nome);
		} catch (err) {
			console.error('C\'è stato un problema nel trovare la ingrediente:', err);
			throw err;
		}
		return ingrediente;
	}

	async getIngredienteID(_id) {
		let ingrediente = null;
		try {
			ingrediente = await Ingrediente.findById(_id).lean();
		} catch (err) {
			console.error('C\'è stato un problema nel trovare la ingrediente:', err);
			throw err;
		}
		return ingrediente;
	}

	async getMenuID(_id) {
		let menu = null;
		try {
			menu = await Menu.findById(_id)
				.populate('Settimane')
			console.log('Menu trovata per ID:', menu);
		} catch (err) {
			console.error('C\'è stato un problema nel trovare il menu:', err);
			throw err;
		}
		return menu;
	}

	async getSettID(_id) {
		let settim = null;
		try {
			settim = await Settimana.findById(_id)
				.populate('Giorni.Pranzo')
				.populate('Giorni.Cena');
			console.log('Settimana trovata per ID:', settim);
		} catch (err) {
			console.error('C\'è stato un problema nel trovare la settimana:', err);
			throw err;
		}
		return settim;
	}

	async getSettByMenID(_id, nSett) {
		let menu = null;
		try {
			menu = await Menu.findById(_id)
				.populate('Settimane')
			console.log('Menu trovata per ID:', menu);
		} catch (err) {
			console.error('C\'è stato un problema nel trovare il menu:', err);
			throw err;
		}
		return await getSettID(menu.Settimane[nSett]);
	}

	async close() {
		try {
			await mongoose.disconnect();
			console.log('Disconnesso da MongoDB.');
		} catch (err) {
			console.error('Errore durante la disconnessione da MongoDB:', err);
		}
	}
}

module.exports = DBmenu;