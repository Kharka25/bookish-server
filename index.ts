import server from 'src/server';
import { PORT } from '@utils/variables';

server.listen(PORT, () => {
	console.log('Server is listening on port: ', PORT);
});
