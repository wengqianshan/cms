require('../css/index.css');

import User from './user';
console.log(User)

class People {

    constructor(props) {
      this.name = 'ming'
    }
    
    get() {
        console.log(this.name)
    }
}

var p = new People();
p.get()