import mongoose from 'mongoose';

export const createOrReturnDBConnection = () => {
	let db = mongoose.connection;

	return new Promise((resolve, reject) => {
		if (db.readyState) return resolve(db);

		mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true });
		mongoose.Promise = global.Promise;
		// Get the default connection
		db = mongoose.connection;

		db.once('open', () => {
			console.log('Connected to mongoose ');
			resolve(db);
		});

		db.on('connected', () => {
			console.log('Mongoose connected');
			resolve(db);
		});

		db.on('disconnected', (err) => {
			reject(err);
		});

		// Bind connection to error event (to get notification of connection errors)
		db.on('error', (error) => {
			console.log({ error });
		});

		process.on('SIGINT', () => {
			db.close(() => {
				console.log('Mongoose default connection is disconnected due to application termination');
				process.exit(0);
			});
		});
	});
};