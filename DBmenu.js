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

	async getAllRicette() {
		let ricette = [];
		try {
			ricette = await Ricetta.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione delle ricette:', err);
			throw err;
		}
		return ricette;
	}// /ricette /DELETERicetta /ricet /Nricetta /DELETETUTTOric /CleanRic

	async getAllRicetteJN() {
		let ricette = [];
		try {
			ricette = await Ricetta.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione delle ricette:', err);
			throw err;
		}
		return ricette;
	} // noooo

	async getAllIngredienti() {
		let ingredienti = [];
		try {
			ingredienti = await Ingrediente.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione degli ingredienti:', err);
			throw err;
		}
		return ingredienti;
	} // /ingredienti e  /ingred //Ningrediente /DELETEingredient

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
	} // /DELETEingredient

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
	} // /DELETERicetta

	async RimuoviTuttoRic() {
		try {
			await Ricetta.deleteMany({}); // per droppare tutte ricette!!!!
			return null;
		} catch (err) {
			console.error(err);
			throw err;
		}
	} // /DELETETUTTOric

	async CleanTuttoRic() {
		try {
			await Ricetta.updateMany({}, { $set: { Menus: [] } });
			return null;
		} catch (err) {
			console.error("Errore durante lo svuotamento dei Menu:", err);
			throw err;
		}
	} // /CleanRic

	async RimuoviTuttoMen() {
		try {
			await Settimana.deleteMany({}); // per droppare tutte ricette!!!!
			await Menu.deleteMany({}); // per droppare tutte ricette!!!!
			return null;
		} catch (err) {
			console.error(err);
			throw err;
		}
	} // /DELETETUTTOmen

	async getAllIngredientiJN() {
		let ingredienti = [];
		try {
			ingredienti = await Ricetta.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione degli ingredienti:', err);
			throw err;
		}
		return ingredienti;
	} // noooo

	async insertSettimana(giorni, id, idMen) {
		try {
			let ricetteNuove = [];
			const giorniProcessati = [];

			const nomiGiorni = [
				"1", "2", "3", '4', "5", "6", "7","prova"
			];

			for (let i = 0; i < nomiGiorni.length; i++) {
				let pranzoId = null;
				let cenaId = null;
				try {
					const g = giorni[i];
				
					pranzoId = await this._getRicettaId(g.Pranzo);
					cenaId = await this._getRicettaId(g.Cena);

					await Ricetta.findByIdAndUpdate(
						pranzoId,
						{ $addToSet: { Menus: idMen } }, // Aggiunge solo se unico
						{ new: true }
					);
					await Ricetta.findByIdAndUpdate(
						cenaId,
						{ $addToSet: { Menus: idMen } }, // Aggiunge solo se unico
						{ new: true }
					);
					


					if (pranzoId == null) {
						ricetteNuove.push(g.Pranzo);
					}
					if (cenaId == null) {
						ricetteNuove.push(g.Cena);
					}
				} catch (err) {

				}

				giorniProcessati.push({
					Nome: nomiGiorni[i],
					Pranzo: pranzoId,
					Cena: cenaId
				});
			}

			await Settimana.findByIdAndUpdate(
				id,
				{ $set: { Giorni: giorniProcessati } },
				{ new: true }
			);

		} catch (err) {
			console.error('Errore durante l\'inserimento della settimana/menu:', err);
			throw err;
		}
	} // /caricaSettimana

	// Funzione helper per trovare una ricetta esistente (per ID o Nome)
	async _getRicettaId(identificatore) {
		let ricetta = null;
		try {
			ricetta = await Ricetta.findById(identificatore);
		} catch (e) {
			// Se non è un ID valido, cerca per Nome
			ricetta = await Ricetta.findOne({ Name: identificatore });
		}
		return ricetta;
	} // /NomeRic

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
	} // /Nricetta /NricettaJSN

	async modificaRicetta(id, nome, ingred, temperatura, orario, prova, note) {
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
					Prova: prova,
					Note: note
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
	} // /MODricetta

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
	} // /Nmenu

	async popolaMenu(newMenu) {
		const menID = newMenu._id;

		// Lista dei nomi per popolare il campo 'Nome'
		const nomiSettimana = [
			"1", "2", "3", '4', "5", "6", "7", "prova"
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
	} // insertMenu()

	async generaSettimana(settimana) {
		try {
			const temperaturaScelta = settimana.Temperatura;
			const menuId = settimana.Menu;

			let candidati = {};

			try {
				candidati = await Ricetta.find({
					Temperatura: { $in: [temperaturaScelta, 3, 0] },
					Menus: { $ne: menuId }
				});
			} catch (err) {
				console.error('There was a problem finding the ricette' + err);
				throw err;
			}

			const giorniSettimana = [
				"1", "2", "3", '4', "5", "6", "7", "prova"
			];

			const idRicetteUsateInQuestaSettimana = new Set();
			const ingredientiLastSeen = new Map();

			const getIngIds = (ricetta) => {
				if (!ricetta || !ricetta.Ingredienti) return [];
				return ricetta.Ingredienti.map(ing => ing.toString());
			};

			const calcolaPunteggio = (ricetta, giornoIndex) => {
				const ingIds = getIngIds(ricetta);
				let distanzaMinima = 1000;
				for (let ingId of ingIds) {
					if (ingredientiLastSeen.has(ingId)) {
						const distanza = giornoIndex - ingredientiLastSeen.get(ingId);
						if (distanza < distanzaMinima) distanzaMinima = distanza;
					}
				}
				return distanzaMinima + Math.random();
			};

			const selezionaRicetta = async (orariAmmessi, giornoIndex, ricettaDaEvitare = null) => {
				// Filtro 1: Orario compatibile e non usata nella settimana corrente
				let pool = candidati.filter(r =>
					orariAmmessi.includes(r.Orario) &&
					!idRicetteUsateInQuestaSettimana.has(r._id.toString())
				);

				// Filtro 2: Evita ingredienti usati nel pasto precedente dello STESSO giorno
				if (ricettaDaEvitare) {
					const ingredientiVietati = new Set(getIngIds(ricettaDaEvitare));
					const poolFiltrato = pool.filter(r => {
						const ingredientiR = getIngIds(r);
						return !ingredientiR.some(ing => ingredientiVietati.has(ing));
					});

					// Se il filtro ingredienti svuota il pool, lo ignoriamo per non lasciare il pasto vuoto
					if (poolFiltrato.length > 0) {
						pool = poolFiltrato;
					}
				}

				if (pool.length === 0) return null;

				// Ordinamento per varietà (punteggio distanza)
				pool.sort((a, b) => calcolaPunteggio(b, giornoIndex) - calcolaPunteggio(a, giornoIndex));
				const scelta = pool[0];

				// Segna come usata
				idRicetteUsateInQuestaSettimana.add(scelta._id.toString());
				getIngIds(scelta).forEach(id => ingredientiLastSeen.set(id, giornoIndex));

				// Aggiorna la ricetta nel DB aggiungendo il riferimento al Menu
				await Ricetta.findByIdAndUpdate(scelta._id, {
					$addToSet: { Menus: menuId }
				});

				return scelta;
			};

			// 2. Generazione dei giorni
			const nuoviGiorni = [];
			for (let i = 0; i < giorniSettimana.length; i++) {
				// Cerchiamo il pranzo (Orario 1 o 3)
				const pranzo = await selezionaRicetta([1, 3], i, null);

				// Cerchiamo la cena (Orario 2 o 3) passandogli il pranzo per evitare duplicati di ingredienti
				const cena = await selezionaRicetta([2, 3], i, pranzo);

				nuoviGiorni.push({
					Nome: giorniSettimana[i],
					Pranzo: pranzo ? pranzo._id : null,
					Cena: cena ? cena._id : null
				});
			}

			// 3. Salvataggio finale su Settimana
			const settimanaAggiornata = await Settimana.findByIdAndUpdate(
				settimana._id,
				{ $set: { Giorni: nuoviGiorni } },
				{ new: true }
			);

			return settimanaAggiornata;

		} catch (err) {
			console.error("Errore generazione settimana:", err);
			throw err;
		}
	} // /genSett

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
	} // /Ningrediente

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
	} // noooo

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
	} //  noooo

	async getRicetta(nome) {
		let ricetta = null;
		try {
			ricetta = await Ricetta.findOne({ Name: nome });
		} catch (err) {
			console.error('C\'è stato un problema nel trovare la ricetta:', err);
			throw err;
		}
		return ricetta;
	} // noooo

	async removeIngRecepit(nome, id) {
		try {
			console.log("Cerco ricetta:" + nome + " con ID ingrediente:" + id);

			// Trova la ricetta per nome e rimuovi l'ingrediente specificato
			const updatedRicetta = await Ricetta.findOneAndUpdate(
				{ Name: nome },
				{ $pull: { Ingredienti: id } }, 
				{ new: true } 
			);

			if (!updatedRicetta) {
				console.error("Ricetta non trovata");
				return null;
			}

			console.log("Ricetta aggiornata:", updatedRicetta);
			return updatedRicetta; 
		} catch (err) {
			console.error('C\'è stato un problema nel rimuovere l\'ingrediente dalla ricetta:', err);
			throw err;
		}
	} // /DELETEingFROMrec

	async getAllMenu() {
		let menus = [];
		try {
			menus = await Menu.find()
				.populate('Settimane')
				.lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione delle settimane:', err);
			throw err;
		}
		return menus;
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
	} // noooo

	async getIngredienteID(_id) {
		let ingrediente = null;
		try {
			ingrediente = await Ingrediente.findById(_id).lean();
		} catch (err) {
			console.error('C\'è stato un problema nel trovare la ingrediente:', err);
			throw err;
		}
		return ingrediente;
	} // /NomeIngr

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
	} // /MenuID

	async getPitstopID(_id) {
		let RicetteFree = [];
		try {
			RicetteFree = await Ricetta.find({
				Menus: { $ne: _id }
			});
			console.log('Ricette libere trovate per ID: ', RicetteFree);
		} catch (err) {
			console.error('C\'è stato un problema nel trovare le ricette libere:', err);
			throw err;
		}
		return RicetteFree;
	} // /PitstopID

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
	} // /pian

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