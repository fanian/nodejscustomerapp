var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var path =require('path');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var app=express();

// var logger = function(req,resp,next){
// 	console.log('logging....');
// 	next();
// }
// app.use(logger);


app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next){
     res.locals.errors = null;
     next();
});



app.use(expressValidator({
	errorFormatter: function(param,msg,value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		while(namespace.lenght){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));


var users = [
{
	id: 1,
	first_name: 'John',
	last_name: 'Doe',
	email: 'test@test.ru'
},
{
	id: 2,
	first_name: 'Dasha',
	last_name: 'Fun',
	email: 'test2@test.ru'
},
{
	id: 3,
	first_name: 'Grant',
	last_name: 'Fun',
	email: 'test3@test.ru'
}
]

app.get('/',function(req, res){
	db.users.find(function (err, docs) {
		console.log(docs);
		res.render('index',{
		title:'Customers',
		users: docs
	});
	})
	
});
app.post('/users/add', function(req, res){

	req.checkBody('first_name', 'First name is Required').notEmpty();
	req.checkBody('last_name', 'last name is Required').notEmpty();
	req.checkBody('email', 'email is Required').notEmpty();
	var errors = req.validationErrors();
	if(errors){
		res.render('index',{
		title:'Customers',
		users: users,
		errors: errors
	});
	}else{
		var newUser = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email
	}	
	db.users.insert(newUser, function(err, result){
		if(err){
			console.log(err);
		}
		res.redirect('/');
	});

	}

	
});

app.delete('/users/delete/:id', function(req,res){
	db.users.remove({_id: ObjectId(req.params.id)},function(err,result){
		if (err) {
			console.log(err);
		}
		res.redirect('/');
	});
});

app.listen(3000, function(){
	console.log('srv start at the port 3000');
})