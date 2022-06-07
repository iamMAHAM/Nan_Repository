const apiKey  = "714e977060730eeb086fbb1570c15633"
const baseUrl = "https://api.themoviedb.org/3"
const imgUrl = "https://image.tmdb.org/t/p/w500"
let container = document.querySelector(".container")
let vp = document.querySelector(".vp")
let logout = document.querySelector("#logout")
let search_input = document.querySelector("#search")
let loupe = document.querySelector(".lol")
console.log(search_input)
let fetched = []
let currentPage = 1
let datas = null
let isConnected
let prev = document.querySelector(".prev")
let next = document.querySelector(".next")
let currentEvent = null
let pagination = document.querySelector(".pagination")
let leftArrow = document.querySelector(".left")
let rightArrow = document.querySelector(".right")

function fillImages(array)
{
	for (let i = 0; i < array.length; i++)
	{
		container.innerHTML +=
		`
		<div class="cadre" id=${array[i].id} href="details.html" onclick="newPage(event)">
			<span class="definition oncadre">HD</span>
			<span class="rate oncadre">${array[i].vote_average}</span>
			<img src="${imgUrl+array[i].poster_path}" alt="" class="image">
			<p class="title oncadre">${array[i].original_title.toLowerCase()}</p>
		</div>
		`
	}
}

async function fetchImage()
{
	try
	{
		id = generateNumber(0, 5000)
		let details = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr`)
		if (details.ok)
		{
			details = await details.json()
			if (!details.poster_path){throw TypeError(`error while loading this id : ${id}`)}
			datos = {
				vote_average: details.vote_average,
				title: details.title,
				poster_path: details.poster_path,
			}
			fetched.push(datos)
		} else {throw TypeError(`error while loading this id : ${id}`)}
	}
	catch (e){}
	return fetched
}

async function fetchImages()
{
	fetched = []
	while (fetched.length < 20){await fetchImage()}
}

function generateNumber(min, max){ return Math.floor(Math.random() * (max - min) + min) }

async function extendImages(page, e=null)
{
	currentPage = Number(currentPage)
	if (isNaN((Number(page))))
	{
		if (page === "prev"){page = currentPage - 1}
		else if (page === "next"){page = currentPage + 1}
	}
	currentPage = Number(page)
	console.log("currentPage : ", currentPage)
	let res = await fetch(`${baseUrl}/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&language=fr&page=${page}`)
	res = await res.json()
	// container.innerHTML = ""
	fillImages(res.results)
	if (currentPage <= 1){prev.disabled = true}
	else (prev.disabled = false)
	if (e)
	{
		for (let i = 0; i < pagination.children.length; i++)
		{
			console.log(e.target)
			if (e.target === pagination.children[i]){pagination.children[i].style.backgroundColor = "green"}
			else{pagination.children[i].style.backgroundColor = "white"}
		}
	}
}

function joinArray(array)
{
	let joined = []
	array.forEach(element => {
		joined.push(element.name)
	});
	return joined.join(", ")
}
async function getDetails(e)
{
	id = e.target.parentElement.id
	let res = await fetch(`${baseUrl}/movie/${id}?api_key=${apiKey}&language=fr`)
	res = await res.json()
	return {
		original_title: res.original_title,
		overview: res.overview,
		vote_average: res.vote_average,
		gender: joinArray(res.genres),
		production_companies: joinArray(res.production_companies),
		release_date: res.release_date.slice(0, 4),
		poster_path: res.poster_path
	}
}

function search(e)
{
	console.log("changed value : ", e.target.value)
	let input = e.target.value
	let titles = document.querySelectorAll(".title")
	for (let i = 0; i < titles.length; i++)
	{
		if (titles[i].textContent.includes(input)){titles[i].parentElement.style.display = "flex"}
		else {titles[i].parentElement.style.display = "none"}
	}
}

async function newPage(e)
{
	datas = await getDetails(e)
	localStorage.setItem("datas", JSON.stringify(datas))
	open("details.html", "new url")
	console.log(datas)
}

function show(){search_input.style.display = "block"}

window.addEventListener("load", async () =>
{
	loupe.addEventListener("click", show)
	isConnected = localStorage.getItem("is_connected")
	if (isConnected == "true"){await extendImages(1)}
	else {window.location.href = "login.html"}
	logout.addEventListener("click", ()=>
	{
		localStorage.setItem("is_connected", "false")
		window.location.href = "login.html"
	})

	$('.first-slide').slick(
		{
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 3,
		}
	)
	document.querySelector(".slick-prev.slick-arrow").innerHTML = '<i class="fa-solid fa-circle-arrow-left icones left"></i>'
	document.querySelector(".slick-next.slick-arrow").innerHTML = '<i class="fa-solid fa-circle-right icones right"></i>'
	
})