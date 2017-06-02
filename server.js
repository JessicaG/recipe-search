const algoliasearch = require('algoliasearch')
const express = require('express')
const path = require('path')
const app = express()

app.get('/', function (req, res) {
	  res.sendFile(path.join(__dirname, 'index.html'))
})

var client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
var index = client.initIndex('recipes');
var contactsJSON = require('./recipes.json');

index.addObjects(contactsJSON, function(err, content) {
  if (err) {
    console.error(err);
  }
});

index.setSettings({
  'customRanking': ['desc(social_rank)']
}, function(err, content) {
  console.log(content);
});

searchRecipes('query')
	.catch(err => handleError(err))
	.then(content => handleContent(content))

function searchRecipes(query) {
	return new Promise(function(resolve, reject) {
		index.search(query, {
		  attributesToRetrieve: ['title', 'source_url','image_url'],
		  hitsPerPage: 50
		}, function searchDone(err, content) {
			if (err) reject(err)
			else resolve(content)
		});
	})
}

app.post('/:query', function(req, res) {
	searchRecipes(req.params.query)
		.then(content => res.json(content))
})

app.listen(3000, function () {
	  console.log('Example app listening on port 3000!')
})
