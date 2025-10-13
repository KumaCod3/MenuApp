const mongoose = require('mongoose');

const ingredientiSchema = new mongoose.Schema({
	Name: { type: String, required: true },
	Price: { type: Number, required: true },
});
const Ingrediente = mongoose.model('Ingrediente', ingredientiSchema);

const ricettaSchema = new mongoose.Schema({
	Name: { type: String, required: true },
	Ingredienti: [{ type: mongoose.Types.ObjectId, ref: 'Ingrediente' }],
	Temperatura: { type: Boolean, required: true},
	Orario: { type: Boolean, required: true}
});
const Ricetta = mongoose.model('Ricetta', ricettaSchema);

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
    }
	
	async getAllRicetteJN() {
		let ricette = [];
        try {
            ricette = await Ricetta.find().lean();
			//console.log('Ecco le ricette: '+ ricette);
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
			//console.log('Ecco gli ingredienti:');
        } catch (err) {
            console.error('C\'è stato un problema con l\'estrazione degli ingredienti:', err);
            throw err;
        }
		return ingredienti;
    }
	
	async removeSingleIngredient(name) {
		let updatedItem =null;
		try {
			let item = await Ingrediente.findOneAndDelete({ 'Name':name });
			if (item == null) {
				return null;
			}
		} catch (err) {
			throw err;
		}
		return;
	}
	
	async removeSingleRecepit(name) {
		let updatedItem =null;
		//console.log("Rimuovo: "+name);
		try {
			let item = await Ricetta.findOneAndDelete({ 'Name':name });
			if (item == null) {
				return null;
			}
		} catch (err) {
			throw err;
		}
		return;
	}
	
	async getAllIngredientiJN() {
		let ingredienti = [];
        try {
            ingredienti = await Ricetta.find().lean();
			//console.log('Ecco gli ingredienti: '+ ingredienti);
        } catch (err) {
            console.error('C\'è stato un problema con l\'estrazione degli ingredienti:', err);
            throw err;
        }
		return ingredienti;
    }
	
	async insertRicetta(nome, ingred, temperatura, orario) {
//console.log("Provo");
		let ingredArray=[];
		for (let i=0; i<ingred.length;i++){
			const nomeGiro=ingred[i];
			let ingredienti= nomeGiro.length>0?nomeGiro:"noIng";
			
			let ingrediente = null;
			try {
				ingrediente = await Ingrediente.findById(ingredienti);
				//console.log('ingrediente trovata per nome:', ingrediente);
			} catch (err) {
//console.log('L\' ingrediente ID non esiste:');
				try {
//console.log('Cerco per Nome :');
					ingrediente = await Ingrediente.findOne({ Name: ingredienti });
					
//console.log('ingrediente trovata per nome:', ingrediente);
				} catch (err) {
					console.error('C\'è stato un problema nel trovare la ingrediente:', err);
					throw err;
				}
			}
			if (ingrediente == null){
//console.log('provo a creare n ing');
//console.log("Nomeee: "+nomeIng);
				try {
					let newIngrediente = new Ingrediente({
						Name: ingredienti,//QQQQQQQQQQQQQQ
						Price: 0
					});
//console.log(newIngrediente);
					await newIngrediente.save();
					ingrediente=newIngrediente;
//console.log('Ingrediente inserito con successo: '+ingrediente);

				} catch (err) {
					console.error('C\'è stato un problema con l\'inserimento delingrediente:', err);
					throw err;
				}
			}
			ingredArray.push(ingrediente);
		}
// console.log("Arrai finito: "+ingredArray);
		try {
//console.log("temp: "+temperatura+" ora: "+orario);
			const newRicetta = new Ricetta({
				Name: nome,
				Ingredienti: ingredArray,
				Temperatura: temperatura,
				Orario: orario
			});
//console.log("temp: "+newRicetta.Temperatura+" ora: "+newRicetta.Orario);
			await newRicetta.save();
		} catch (err) {
			console.error("non e un ingrediente");
		}
	}

	async insertIngrediente(nome, prezzo) {
		let newIngrediente = null;
console.log("IIIIgred: "+prezzo);
        try {
            newIngrediente = new Ingrediente({
                Name: nome,
				Price: prezzo
            });
console.log(newIngrediente);
            await newIngrediente.save();
            console.log('Ingrediente inserito con successo2:');

        } catch (err) {
            console.error('C\'è stato un problema con l\'inserimento delingrediente:', err);
            throw err;
        }
		return newIngrediente;
    }
	
	async getRicetteTemp(temp) {
        let ricette = [];
        if(!Number.isInteger(temp)) { 
            return ricette; 
        } 
 
        try { 
            ricette = await Ricetta.find({ Temperatura: temp }); 
console.log("array: "+ricette.length);
        } catch (err) { 
            console.log('There was a problem finding the ricette'+err); 
            throw err; 
        } 
        return ricette; 
    }
	
	async getRicetteOra(ora) {
        let ricette = [];
        if(!Number.isInteger(temp)) { 
            return ricette; 
        } 
 
        try { 
            ricette = await Ricetta.find({Orario: ora}); 
console.log("array: "+ricette.length);
        } catch (err) { 
            console.log('There was a problem finding the ricette'+err); 
            throw err; 
        } 
        return ricette; 
    }
	
	async getRicetta(nome) {
        let ricetta = null;
        try {
            ricetta = await Ricetta.findOne({ Name: nome });
            //console.log('Ricetta trovata per nome:', ricetta);
        } catch (err) {
            console.error('C\'è stato un problema nel trovare la ricetta:', err);
            throw err;
        }
        return ricetta;
    }
	
	async getRicettaID(_id) {
        let ricetta = null;
        try {
            ricetta = await Ricetta.findById(_id);
            //console.log('Ricetta trovata per ID:', ricetta);
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
console.log("Almeno ci provo???");
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
console.log('DB cerco ID:', _id);
        try {
            ingrediente = await Ingrediente.findById(_id).lean();
        //    console.log('ingrediente trovata per ID:', ingrediente);
        } catch (err) {
            console.error('C\'è stato un problema nel trovare la ingrediente:', err);
            throw err;
        }
        return ingrediente;
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