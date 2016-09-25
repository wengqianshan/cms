require('../css/index.css');

let users = ['xiaoshan', 'ruoguan'];
import User from './user';
console.log(User)

users = users.map((user) => {
    return user + '11'
})

console.log(users)

class People {
    //name = 'ming'

    constructor(props) {
      this.name = 'ming'
    }


    get() {
        console.log(this.name)
    }
}

var p = new People();
p.get()