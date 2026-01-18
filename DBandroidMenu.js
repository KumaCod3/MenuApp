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
	Note: { type: String, required: true },
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

	// TODO






	async close() {
		try {
			await mongoose.disconnect();
			console.log('Disconnesso da MongoDB.');
		} catch (err) {
			console.error('Errore durante la disconnessione da MongoDB:', err);
		}
	}
}

module.exports = DBandroidMenu;