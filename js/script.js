let title = document.querySelector('#search-input');
let search = document.querySelector('.fa-search');
let nextPage = document.querySelector('.next-page-div');
let previousPage = document.querySelector('.previous-page-div');
let currentPage = document.querySelector('#pageValue');
let showResults = document.querySelector('#result-display-div');
let showNominations = document.querySelector('#nominated-movies')
let totalResult = document.querySelector('#total-result')
// let nominationCount = document.querySelector('.nomination-complete-div')
let nominationPlaceholder = document.querySelector('.nomination-placeholder')
let searchValue = document.querySelector('#search-value')

title.addEventListener('input', ()=>{
    let queryValue = title.value.toLowerCase();
    getMovies(queryValue)
    searchValue.innerText = queryValue;
})

let getMovies =(title, pageNumber=1)=>{
    fetch(`https://www.omdbapi.com/?apikey=d44ba90c&s=${title}&page=${pageNumber}`)
    .then(resp=>resp.json())
    .then(data=>{            
        console.log(data)
        if(data.Response === 'False'){
            console.log(data.Error)
            showResults.innerText = data.Error;
        }
        else{
            previousPage.classList.remove('disabled')
            nextPage.classList.remove('disabled')
            previousPage.classList.add('enabled')
            nextPage.classList.add('enabled')

            displayResult(data.Search, pageNumber, data.totalResults)

            nominateMovie()

            if(pageNumber === 1){
                disableNavButton(previousPage)
            }
        }
    })
}

let displayResult =(data, pageNum, totalSearch)=>{
    console.log(data)
    showResults.innerText = '';

    let buttonText = 'Nominate'
    let buttonClass = 'nominate-button'

    for(let x=0; x < data.length; x++){
        createMovieItem(data[x], buttonText, buttonClass, showResults)
    }
    currentPage.innerText = pageNum;

    if(data.length % 10 > 0){
        disableNavButton(nextPage)
    }
    totalResult.innerText = totalSearch;
}

let createMovieItem=(data, buttonText, buttonClass, category)=>{
    let movieWrapper = document.createElement('div')
        movieWrapper.classList = `movie-wrapper ${buttonText}`;
    
    let bulletIcon = document.createElement('i')
        bulletIcon.classList = 'fas fa-sign-out-alt'
    
    let thumbnailDiv = document.createElement('div')
        thumbnailDiv.classList = 'thumbnail-div'
        
    let movieThumbnail = document.createElement('img')
        movieThumbnail.classList = 'movie-thumbnail'
        if(data.Poster === 'N/A'){
            movieThumbnail.setAttribute('src', `https://res.cloudinary.com/tamsay/image/upload/v1610757347/video-placeholder_mmd5fw.png`)
        }
        else{
            movieThumbnail.setAttribute('src', `${data.Poster}`)
        }
        movieThumbnail.setAttribute('alt', 'movie-thumbnail')
        thumbnailDiv.appendChild(movieThumbnail)
    
    let movieDetails = document.createElement('div')
        movieDetails.classList = 'movie-details'
    
    let movieTitle = document.createElement('p')
        movieTitle.classList = 'movie-title'
        movieTitle.innerText = data.Title;
    

    let movieYear = document.createElement('p')
        movieYear.classList = 'movie-year'
        movieYear.innerText = data.Year;

    let movieIdDiv = document.createElement('div')
        movieIdDiv.classList = 'movie-id-div'
    
    let idSpan = document.createElement('span')
        idSpan.classList = 'movie-id-descriptor'
        idSpan.innerText = 'ID: '

    let movieId = document.createElement('p')
        movieId.classList = 'movie-id'
        movieId.innerText = data.imdbID;

    movieIdDiv.appendChild(idSpan)
    movieIdDiv.appendChild(movieId)

    let nominateBtn = document.createElement('button')
        nominateBtn.classList = buttonClass
        nominateBtn.innerText = buttonText;         
        
        if(buttonText === 'Nominate'){
            let isNominated = checkNominations(data.imdbID)
            if(isNominated){
                disableNavButton(nominateBtn)
            }
            else{
                enableNavButton(nominateBtn)
            }
        }
        
    movieWrapper.appendChild(bulletIcon)
    movieWrapper.appendChild(thumbnailDiv)
    
    movieDetails.appendChild(movieTitle)
    movieDetails.appendChild(movieYear)
    movieDetails.appendChild(movieIdDiv)
    movieDetails.appendChild(nominateBtn)

    movieWrapper.appendChild(movieDetails)

    category.appendChild(movieWrapper)
}

let disableNavButton=(div)=>{
    div.classList.add('disabled')
    div.classList.remove('enabled')
}

let enableNavButton=(div, error)=>{
    div.classList.add('enabled');   
    div.classList.remove('disabled') 
}

nextPage.addEventListener('click', ()=>{
    let page = Number(currentPage.textContent);
    page++;
    let lastPage = Number(showResults.textContent);

    if(lastPage % 10 > 0){
        disableNavButton(nextPage)
    }
    else{
        getMovies(title.value, page, nextPage)
    }
})

previousPage.addEventListener('click', ()=>{
    let page = Number(currentPage.textContent);
    if(page <= 1){
        console.log('first page reached')
        disableNavButton(previousPage)
    }
    else{
        page--;
        getMovies(title.value, page, previousPage)
    }
})

let nominateMovie = () =>{
    let allNominateBtns = document.querySelectorAll('.nominate-button');

        [...allNominateBtns].map(items=>{
            items.addEventListener('click', ()=>{
                let parent = items.parentElement.parentElement;
                let title = parent.querySelector('.movie-title').textContent;
                let year = parent.querySelector('.movie-year').textContent;
                let poster = parent.querySelector('.movie-thumbnail').src;
                let movieId = parent.querySelector('.movie-id').textContent

                let data = {
                    Title: title,
                    Year: year,
                    Poster: poster,
                    imdbID: movieId,
                };

                if(checkNominationCount()){
                    disableNavButton(items)
                    displayNominations(data)
                }
                else{
                    // nominationCount.innerText = 'Vote don finish'
                    alert('Maximum number of movie nominated, remove one from the nominated list to make a new nomination')
                }
                    
                })
            })
    }

let displayNominations =(data)=>{
    let buttonText = 'Remove';
    let buttonClass = 'remove-button'
    createMovieItem(data, buttonText, buttonClass, showNominations)
    removeVotedMovie()
    nominationPlaceholder.style.display = 'none'
}

let removeVotedMovie =()=>{
    let allRemoveButtons = document.querySelectorAll('.remove-button');
        [...allRemoveButtons].map(items =>{
            items.addEventListener('click', ()=>{
                let parent = items.parentElement.parentElement;
                let movieId = parent.querySelector('.movie-id').textContent;
                
                checkResultPage(movieId);

                parent.remove()

                let nominatedMoviesCount = document.querySelectorAll('.remove-button')
                if([...nominatedMoviesCount].length === 0){
                    nominationPlaceholder.style.display = 'block'
                }

                // nominationCount.innerText = ''
            })
        })
}

let checkResultPage =(movieId)=>{
    let btns = document.querySelectorAll('.nominate-button');
    let allNominateBtns = [...btns];

    for(let x = 0; x < allNominateBtns.length; x++){
        let parent = allNominateBtns[x].parentElement.parentElement;

        let nominatedMovieId = allNominateBtns[x].parentElement.querySelector('.movie-id').textContent;
        let nominateBtn = parent.querySelector('.nominate-button');

        if((movieId === nominatedMovieId)) {
            enableNavButton(nominateBtn)
        }
    }
}

let checkNominations =(movieId)=>{
    let btns = document.querySelectorAll('.remove-button');
    let allRemoveButtons = [...btns];

    for(let x = 0; x < allRemoveButtons.length; x++){
        let parent = allRemoveButtons[x].parentElement.parentElement;

        let nominatedMovieId = allRemoveButtons[x].parentElement.querySelector('.movie-id').textContent;

        if((movieId === nominatedMovieId)) {
            return true;
        }
    }
}

let checkNominationCount =()=>{    
    let allNominatedMoviesButtons = document.querySelectorAll('.remove-button')

    if([...allNominatedMoviesButtons].length <= 4){
        return true;      
    }
    else{
       return false;   
    }
}