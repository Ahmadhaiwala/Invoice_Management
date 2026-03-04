const endpoint = "http://localhost:8000/api/invoice/Rahul Sharma";
const params = new URLSearchParams({
    name:'Rahul Sharma'
});

const url = `${endpoint}?${params.toString()}`;
// url is now "https://api.example.com?id=1&type=new"

fetch(url)
    .then(response => response.json())
    .then(data => console.log(data));
