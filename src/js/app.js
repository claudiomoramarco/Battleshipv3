const { error } = require("web3");



let naveunoCount = 0
let navedueCount = 0
let navetreCount = 0
let navequattroCount = 0
let navecinqueCount = 0

let enemyNaveunoCount = 0
let enemyNavdueCount = 0
let enemyNavetreCount = 0
let enemyNavequattroCount = 0
let enemyNavecinqueCount = 0

//pagina del gioco, oggetti
const userGriglia = document.getElementById('griglia-user')
const enemyGriglia = document.getElementById('griglia-enemy')
const displayGriglia = document.querySelector('.griglia-display')

const setNuovoGioco = document.querySelector('#creaNuovoGioco')
const setPartecipaGioco = document.querySelector('#partecipaGioco')

const navi = document.querySelectorAll('.nave')
const naveuno = document.querySelector('.naveuno-container')
const navedue = document.querySelector('.navedue-container')
const navetre = document.querySelector('.navetre-container')
const navequattro = document.querySelector('.navequattro-container')
const navecinque = document.querySelector('.navecinque-container')

let currentPlayer = 'user'
//definizione della griglia predefinita di gioco
const width = 10

//ready
let ready = false 


const rotateButton = document.querySelector('#rotate')
const startButton = document.querySelector('#start')
const quitButton = document.querySelector('#quit') //da implementare in html
const turnDisplay = document.querySelector('#whose-go')
const infoDisplay = document.querySelector('#info')

const userInfo = document.querySelector('#user-info') //da implementare in html
const enemyInfo = document.querySelector('#enemy-info') //da implementare in html
//accusato = charge
const accusaButton = document.querySelector('#accusa') //da implementare in html

var gameId = null
var grandPrize = null
var weiValue = "1000000000000000000"

const userSquares = []
const enemySquares = []

let draggedNave
let draggedNaveLength
let selectedNaveNameWithIndex

let orizzontale = true
let giocoFinito = false

let naviPiazzate = false

let userTurn = false
let accusato = false 

let colpo = -1
let affondato = 0

const naveArray = []

 //posizione della nave
 let boardPositions = []

//definizion dell'oggetto dell'App
App = {
  web3Provider: null,
  contracts: {},
  
  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function () { 

    if(window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access
        console.error("User denied account access")

      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }

    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    web3.eth.defaultAccount = web3.eth.accounts[0];
    return App.initContract();
  },

  
  initContract:function()  {
    //replace me
    $.getJSON("Battleship.json", function(data) {
      var BattleshipArtifact = data; //prendi il contratto e inizializzalo
      
      App.contracts.Battleship = TruffleContract(BattleshipArtifact);
      
      App.contracts.Battleship.setProvider(App.web3Provider);
    });
    return App.bindEvents();
  },

  bindEvents : async function() {
     //qui dobbiamo fare la creazione del gioco con id e delle board
    indietroButton.addEventListener('click', App.backToMenu);
    creaNuovoGioco.addEventListener('click', App.creaNuovoGioco);
    partecipaGioco.addEventListener('click', App.partecipaGioco);
    inviaCondizioniGioco.addEventListener('click', App.impostaCondizioniGioco);
    inviaGiocoId.addEventListener('click', App.inviaGiocoId);
    accettaCondizioniGioco.addEventListener('click', App.accettaCondizioniGioco);
    chiudiCondizioniGioco.addEventListener('click', App.chiudiCondizioniGioco);
    quitButton.addEventListener('click', App.quitButton);
    rotateButton.addEventListener('click', App.rotate);
    startButton.addEventListener('click', App.startButton);
    accusaButton.addEventListener('click', App.accusaButton);

    navi.forEach(nave => {
      nave.addEventListener('dragstart', App.dragStart)
      nave.addEventListener('mousedown', (e) => {
        selectedNaveNameWithIndex = e.target.id
      })
    });
    
    $(document).on('input', "#grandPrize", (event) =>  grandPrize = event.target.value);
    $(document).on('input', "#gameId", (event) =>  gameId = event.target.value);
  },

  backToMenu: function() {
    setNuovoGioco.style.display = 'none'
    setPartecipaGioco.style.display = 'none'

  },
  
  creaNuovoGioco: function() {
    console.log("Creazione Nuovo gioco in corso...")
    partecipaGioco.style.display = 'none';
    creaNuovoGioco.style.display = 'none';
    setNuovoGioco.style.display = 'block';
  },
  
  partecipaGioco: function() {
    console.log("Partecipa Nuovo Gioco in corso...")
    creaNuovoGioco.style.display = 'none';
    partecipaGioco.style.display = 'none';
    setPartecipaGioco.style.display = 'block';
  },

  impostaCondizioniGioco: function() {
    console.log("Impostazione Condizioni Gioco in corso")
    if(!grandPrize) {
      return alert("Inserisci un importo valido!");
    }
      else if(grandPrize <= 0) 
        return alert("Inserisci un importo valido, maggiore di 0!");
        naveArray.push({ 
            name: 'naveuno',
            directions: [
              [0, 1],
              [0, width]
            ]
          },
          {
            name: 'navedue',
            directions: [
              [0, 1, 2],
              [0, width, width*2]
            ]
          },
          {
            name: 'navetre',
            directions: [
              [0, 1, 2],
              [0, width, width*2]
            ]
          },
          {
            name: 'navequattro',
            directions: [
              [0, 1, 2, 3],
              [0, width, width*2, width*3]
            ]
          },
          {
            name: 'navecinque',
            directions: [
              [0, 1, 2, 3, 4],
              [0, width, width*2, width*3, width*4]
            ]
          },)
        },
  
    App.contracts.Battleship.deployed().then(async function(instance) {
      battleshipInstance = instance;
      return battleshipInstance.createGame({value : (grandPrize*weiValue)})
    }).then(async function (logArray){
      gameId = logArray.logs[0].args._gameId.toNumber();
      if (gameId < 0) {
        console.error("Qualcosa è andato storto, il GameId è negativo");
      }
      else {
        App.handleGameEvents();
      }
    }).catch(function(err){
      console.error(err);
    })
  },


  createBoard : function(griglia, squares){
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.dataset.id = i;
      griglia.appendChild(square);
      squares.push(square);
      
      boardPositions.push(i)  // Memorizza l'ID del quadrato nell'array boardPositions
    }
    createBoard(userGriglia, userSquares)
    createBoard(enemyGriglia, enemySquares)
  }, 

  gioco
  function iniziaMultiplayer(){
  
    function giocatoreConnessoDisconnesso(num) {
      $(`${giocatore}.connected span`).toggleClass('green');
      if (parseInt(num) === numeroGiocatore) {
        $(giocatore).css('font-weight', 'bold');
      }
    }
    
  


//giocatori sono pronti per giocare
startButton.addEventListener('click', () => {
  playGameMulti
})






  //ready button 
  startButton.addEventListener('click', () => {
    if(naviPiazzate)
      playGame
  })
    
  
  //submitting the attack
  userSquares.forEach(square => {
    square.addEventListener('click', () => {
      if(currentPlayer == 'user' && enemyPronto) {
        colpo = square.dataset.id
      }
    })
  })

  //whos ready  // possiamo farlo facendo decidere se i due player hanno accettato il guadagno stabilito inizialmente
  function whosReady(){
    if(currentPlayer == 'user'){
      turnDisplay.innerHTML = 'Tuo Turno'
    }
    if(currentPlayer == 'enemy'){
      turnDisplay.innerHTML = 'Enemy Turno'
    }
  }






  //funzione sing player
  function iniziaSingolo(){
    modalitaDiGioco = "giocatoreSingolo"

  generate(naveArray[0])
  generate(naveArray[1])
  generate(naveArray[2])
  generate(naveArray[3])
  generate(naveArray[4])


  startButton.addEventListener('click', playGame)

  } 

  //crea board
  // a questa le diamo un Id cosi per il multiplayer si 
  //puo collegare con l id della board nemica
  //ogni square sulla board ha un numero, un id che noi vogliamo passare 
  
  



 //navi dell'avversario 
 //Disponi le navi nella griglia dell'utente in modo casuale
 function generate(nave) {
  let randomDirection = Math.floor(Math.random() * nave.directions.length)
  let current = nave.directions[randomDirection]
  if (randomDirection === 0) direction = 1
  if (randomDirection === 1) direction = 10
  let randomStart = Math.abs(Math.floor(Math.random() * enemySquares.length - (nave.directions[0].length * direction)))

  const isTaken = current.some(index => enemySquares[randomStart + index].classList.contains('taken'))
  const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
  const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

  if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => enemySquares[randomStart + index].classList.add('taken', nave.name))

  else generate(nave)
}

//qui pc genera le navi automaticamente,
//ma noi vogliamo che funzioni solo in giocatore singolo


// rotazione nella board delle navi 
function rotate() {
  if (orizzontale) {
    naveuno.classList.add('naveuno-container-vertical')
    navedue.classList.add('navedue-container-vertical')
    navetre.classList.add('navetre-container-vertical')
    navequattro.classList.add('navequattro-container-vertical')
    navecinque.classList.add('navecinque-container-vertical')
    orizzontale = false
    console.log(orizzontale)
    return 
  }
  if (!orizzontale) {
    naveuno.classList.remove('naveuno-container-vertical')
    navedue.classList.remove('navedue-container-vertical')
    navetre.classList.remove('navetre-container-vertical')
    navequattro.classList.remove('navequattro-container-vertical')
    navecinque.classList.remove('navecinque-container-vertical')
    orizzontale = true
    console.log(orizzontale)
    return
    
  }
}

rotateButton.addEventListener('click', rotate);

//move around user ship
navi.forEach(nave => nave.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragover', dragOver))
userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
userSquares.forEach(square => square.addEventListener('drop', dragDrop))
userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

let selectedNaveNameWithIndex
let draggedNave
let draggedNaveLength

navi.forEach(nave => nave.addEventListener('mousedown', (e) => {
  selectedNaveNameWithIndex = e.target.id
  //console.log(selectedNaveNameWithIndex)
}))

function dragStart(event) {
  draggedNave = this
  draggedNaveLength = this.childNodes.length
  //console.log(draggedNave)
  
  //Per rendere un elemento non trascinabile dopo essere stato trascinato una volta
  //il metodo draggable dell'elemento e impostarlo su false
  //event.target.setAttribute('draggable', 'false')
  
  
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault()
}

function dragLeave() {
  
  //console.log('drag leave')
}

function dragDrop() {
 //vedo se entra qui console.log('drag drop')
  let naveNameWithLastId = draggedNave.lastChild.id
  let naveClass = naveNameWithLastId.slice(0,-2)
  //console.log(naveClass)
  let lastNaveIndex = parseInt(naveNameWithLastId.substr(-1))
  let naveLastId = lastNaveIndex + parseInt(this.dataset.id)
 // console.log(naveLastId)
  const notAllowedOrizzontale = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
  const notAllowedVerticale = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
  
  let newNotAllowedOrizzontale = notAllowedOrizzontale.splice(0, 10 * lastNaveIndex)
  let newNotAllowedVerticale = notAllowedVerticale.splice(0, 10 * lastNaveIndex)

  selectedNaveIndex = parseInt(selectedNaveNameWithIndex.substr(-1))

  naveLastId = naveLastId - selectedNaveIndex
  //console.log(naveLastId)
   
    if (orizzontale && !newNotAllowedOrizzontale.includes(naveLastId)){
      for (let i=0; i < draggedNaveLength; i++) {
        
        userSquares[parseInt(this.dataset.id) - selectedNaveIndex + i].classList.add('taken', naveClass)
      }
      //quando metteremo la nave che stiamo draggando in un index non consentito ritornera sulla nostra griglia
      
    } else if (!orizzontale && !newNotAllowedVerticale.includes(naveLastId)) {
      for (let i=0; i < draggedNaveLength; i++) {
       
        userSquares[parseInt(this.dataset.id) - selectedNaveIndex + width*i].classList.add('taken', naveClass)
      }
      
    } else return 

    if (displayGriglia) {
      displayGriglia.removeChild(draggedNave);
      if(!displayGriglia.querySelector('.nave')) naviPiazzate = true
    }
    
    draggedNave.style.display='none'

}


function dragEnd(event){

  //console.log('dragend')
  // Rimuovi l'elemento della nave dalla griglia display

  //console.log('dragend')

}


//logica del gioco
function playGame() {
  if (giocoFinito) return
  
  if (currentPlayer === 'user') {
    turnDisplay.innerHTML= 'Il tuo turno'
    enemySquares.on('click', function() {
      App.revealSquare($(this));
    });
  }

  //da fare sempre con web3
  if (currentPlayer === 'enemy') {
    turnDisplay.innerHTML = 'Turno Avversario'
    setTimeout(App.enemyGo,1000)
  }
}




function playGame() {
  if(giocoFinito) return;
  if(currentPlayer === 'user') {
    turnDisplay.text('Il tuo turno')
    enemySquares.on('click', function() {
      revealSquare($(this))
    })
  }
}

if(currentPlayer === 'enemy') {
  turnDisplay.text('Turno Avversario')
  setTimeout(enemyGo,1000)
}


let naveunoCount = 0
let navedueCount = 0
let navetreCount = 0
let navequattroCount = 0
let navecinqueCount = 0

function revealSquare(square) {

  //id passato a colpo" cosi da indicare se è stato colpito o no e il ritorno per sapere dove è stato colpito è object

  const enemySquares = enemyGriglia.querySelector(`div[data-id ='${colpo}']`)
  const obj = Array.from(square.classList) 
  
  if(!enemySquares.classList.contains('boom')&& currentPlayer == 'user' && !giocoFinito) {
    //aggiorna il conto delle navi colpite
    if (obj.includes('naveuno')) naveunoCount++
    if (obj.includes('navedue')) navedueCount++
    if (obj.includes('navetre')) navetreCount++
    if (obj.includes('navequattro')) navequattroCount++
    if (obj.includes('navecinque')) navecinqueCount++
  }
  if (obj.includes('taken')) {
    enemySquares.classList.add('boom')
  
  } else {
    enemySquares.classList.add('miss')
  
  }
  checkForWins()
  currentPlayer = 'enemy'
  playGame()
}

let enemyNaveunoCount = 0
let enemyNavedueCount = 0
let enemyNavetreCount = 0
let enemyNavequattroCount = 0
let enemyNavecinqueCount = 0

function enemyGo(square) {
  
  if (!userSquares[random].classList.contains('boom')) {
    userSquares[random].classList.add('boom')
    // Aggiorna il conteggio delle navi colpite dal enemy
    if (userSquares[random].classList.contains('naveuno')) enemyNaveunoCount++;
    if (userSquares[random].classList.contains('navedue')) enemyNavedueCount++;
    if (userSquares[random].classList.contains('navetre')) enemyNavetreCount++;
    if (userSquares[random].classList.contains('navequattro')) enemyNavequattroCount++;
    if (userSquares[random].classList.contains('navecinque')) enemyNavecinqueCount++;
    checkForWins();
  } else {
    enemyGo();
    return; // Aggiungi questa riga per terminare la funzione dopo la chiamata ricorsiva
  }
  currentPlayer = 'user';
  turnDisplay.innerHTML = 'Il tuo turno';

 
} 


  //se voglio verificare la posizione delle navi 
  /*
  function verificaNaviPosizionate() {
    // Esempi di utilizzo dei dati della blockchain per verificare le posizioni delle navi
    const datiBlockchain = getDatiDallaBlockchain(); // Sostituisci con la tua logica per ottenere i dati dalla blockchain
  
    for (let i = 0; i < boardPositions.length; i++) {
      const id = boardPositions[i];
      const navePosizionata = datiBlockchain[id]; // Sostituisci con la tua logica per ottenere i dati della nave dalla blockchain
      if (navePosizionata) {
        // La nave è posizionata correttamente nell'ID previsto
        $(`[data-id="${id}"]`).addClass('ship');
      } else {
        // Non è stata posizionata nessuna nave nell'ID previsto
        $(`[data-id="${id}"]`).removeClass('ship');
      }
    }
  } 


  */
  

  

function checkForWins() {
  if(naveunoCount === 2) {
    infoDisplay.innerHTML = 'Hai affondato la Nave1 del enemy'
    naveunoCount = 10
  }
  if(navedueCount === 3) {
    infoDisplay.innerHTML = 'Hai affondato la Nave2 del enemy'
    navedueCount = 10
  }
  if(navetreCount === 3) {
    infoDisplay.innerHTML = 'Hai affondato la Nave3 del enemy'
    navetreCount = 10
  }
  if(navequattroCount === 4) {
    infoDisplay.innerHTML = 'Hai affondato la Nave4 del enemy'
    navequattroCount = 10
  }
  if(navecinqueCount === 5) {
    infoDisplay.innerHTML = 'Hai affondato la Nave5 del enemy'
    navecinqueCount = 10
  }
  //dovrebbero essere le navi amiche che dobbiamo rivedere con enemy
  
  if(enemyNaveunoCount === 2) {
    infoDisplay.innerHTML = 'Hai affondato la Nave1 del enemy'
    enemyNaveunoCount = 10
  }
  if(enemyNavedueCount === 3) {
    infoDisplay.innerHTML = 'Hai affondato la Nave2 del enemy'
    enemyNavedueCount = 10
  }
  if(enemyNavetreCount === 3) {
    infoDisplay.innerHTML = 'Hai affondato la Nave3 del enemy'
    enemyNavetreCount = 10
  }
  if(enemyNavequattroCount === 4) {
    infoDisplay.innerHTML = 'Hai affondato la Nave4 del enemy'
    enemyNavequattroCount = 10
  }
  if(enemyNavecinqueCount === 5) {
    infoDisplay.innerHTML = 'Hai affondato la Nave5 del enemy'
    enemyNavecinqueCount = 10
  }
  if ((naveunoCount + navedueCount + navetreCount + navequattroCount + navecinqueCount) === 50 ) {
    infoDisplay.innerHTML = 'Hai vinto'
    giocoTerminato()
    
  }


  if ((enemyNaveunoCount + enemyNavedueCount + enemyNavetreCount + enemyNavequattroCount + enemyNavecinqueCount) === 50 ) {
    infoDisplay.innerHTML = 'Hai perso, ha vinto il pc'
    giocoTerminato()
  } 

}
function giocoTerminato() {
  giocoFinito = true
  startButton.removeEventListener('click', playGame)
  
}
  }



$(function() {
  $(window).load(function() {
    App.init()
  });
});
