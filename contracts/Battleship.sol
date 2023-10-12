// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.2 <0.9.0;


contract Battleship {
    address public giocatore1;
    address public giocatore2;
    mapping(address => bool) public navePiazzata;
    mapping(address => mapping(uint8 => mapping(uint8 => bool))) public griglia;

    modifier soloGiocatori() {
        require(msg.sender == giocatore1 || msg.sender == giocatore2, "Solo i giocatori possono eseguire questa azione");
        _;
    }

    constructor()  {
        giocatore1 = msg.sender;
    }

 function partecipaGioco() public  {
    require(giocatore2 == address(0), "Il gioco al completo");
    giocatore2 = msg.sender;
}


    function piazzaNavi(uint8 x, uint8 y) public soloGiocatori {
        require(!navePiazzata[msg.sender], "Hai piazzato le navi");
        require(x < 10 && y < 10, "Coordinate non valide");
        require(!griglia[msg.sender][x][y], "Posizione  occupata");

        griglia[msg.sender][x][y] = true;
    }

    function attaccoPosizione(uint8 x, uint8 y) public view soloGiocatori {
        require(navePiazzata[giocatore1] && navePiazzata[giocatore2], "Attendi il piazzamento delle navi da entrambi i giocatori");
        require(x < 10 && y < 10, "Coordinate non valide");
        require(!griglia[msg.sender][x][y], "Hai  attaccato questa posizione");

        // Utilizza le coordinate (x, y) per determinare se l'attacco colpisce una nave o meno
    }

    function impostaNaviPosizionate() public soloGiocatori {
        require(!navePiazzata[msg.sender], "Hai  segnalato che hai piazzato le navi");
        require(giocatore1 != address(0) && giocatore2 != address(0), "Attendi che entrambi i giocatori si uniscano");

        navePiazzata[msg.sender] = true;

        bool colpito = false;
        address avversario = (msg.sender == giocatore1) ? giocatore2 : giocatore1;

        uint8 x = 0; // Inserisci qui la coordinata x dell'attacco
        uint8 y = 0; // Inserisci qui la coordinata y dell'attacco

        if (griglia[avversario][x][y]) {
            // L'attacco ha colpito una nave
            colpito = true;
            // Aggiungi qui la logica per gestire l'effetto dell'attacco sulla nave colpita
        }

        emit RisultatoAttacco(msg.sender, x, y, colpito);
    }

    event RisultatoAttacco(address indexed player, uint8 x, uint8 y, bool colpito);
}
