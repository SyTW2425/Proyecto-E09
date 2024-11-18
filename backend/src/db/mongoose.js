import { connect } from 'mongoose';

connect("mongodb://admin:canals@172.16.113.2/anitrackguess?retryWrites=true&w=majority")
      .then(db => console.log('DB is connected'))
      .catch(error => console.log(error));