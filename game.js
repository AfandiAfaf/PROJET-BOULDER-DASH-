const divResultat = document.querySelector("#resultat");

//Définition des touches de clavier
const KEY_Z=90;
const KEY_Q=81;
const KEY_S=83;
const KEY_D=68;

//Définition des valeurs des cases
const case_terre='T';
const case_rocher='R';
const case_diamond='D';
const case_mur='M';
const case_vide='V';
const case_position='P';
const rockford_dead='PE'

//Définition de la position de rockford et nombre de diamonds
let x=0;
let y=0;
let compteur_diamond=0;

//Création de la grille initiale du jeu
const nombre_ligne=16;
const nombre_colonne=32;
let tab = new Array(nombre_ligne);
for (var i=0; i<nombre_ligne; i++){
    tab[i]= new Array(nombre_colonne);
}

//Remplissage de la grille de jeu
for (var i=0; i<nombre_ligne; i++){
    for (var j=0; j<nombre_colonne; j++){
        tab[i][j]='T';
    }
}
tab[8][11]='D';
tab[3][21]='D';
tab[6][16]='R';
tab[12][12]='V';
tab[3][3]='V';
tab[10][25]='R';

//Affichage de la grille de jeu 
function affichagegrille(){
    var texte ="";

    for (var i=0; i<tab.length; i++){
        texte +="<div>";
        for (var j=0; j<tab[i].length; j++){
            if(i==0 || i==(nombre_ligne-1) || j==0 || j==(nombre_colonne-1) ){
                texte += "<img src='img/textures/border.png' style='width:100px;height:100px'>";
            }
            else {
                switch(tab[i][j]){
                    case case_diamond: 
                        texte += "<img src='img/textures/diamond.gif'>";
                        break;
                    case case_terre: 
                        texte += "<img src='img/textures/dirt.png'>";
                        break;
                    case case_rocher: 
                        texte += "<img src='img/textures/stone.png'>";
                        break;
                    case case_mur: 
                        texte += "<img src='img/textures/wall.png'>";
                        break;
                    case case_vide: 
                        texte += "<img src='img/textures/background.png'>";
                        break;
                    case case_position: 
                        x=i;
                        y=j;
                        texte += "<img src='img/textures/rockford.gif'>";
                        break;
                    case case_rockford_dead: 
                        texte += "<img src='img/textures/rockfordmort.png'>";
                        break;
                    default:
                }
                
            }
        }
        texte += "</div>";
    }

    divResultat.innerHTML = texte;
  
}

function toucheclavierdown(a){

    if(a.keyCode== KEY_Z){
        switch(tab[x-1][y]){
            case case_terre:
            break;
            case case_rocher:
                tab[x-1][y]= case_libre;
                tab[x][y]= rockford_dead;
            break;
            case case_diamond:
                tab[x-1][y]= case_rockford;
                tab[x][y]= rockford_libre;
                compteur_diamond ++;
            break;
            case case_mur:
            break;
            case case_libre:
                tab[x-1][y]= case_rockford;
                tab[x][y]= case_libre;
            break;

            default :
                console.log('IMPOSSIBLE MOUVEMENT')
        }
        affichagegrille();
    }

    else if(a.keyCode == KEY_Q){
        switch(tab[x][y-1]){
            case case_terre:
                if(tab[x][y-1]== case_terre && tab[x-1][y-1]== case_mur ){
                    tab[x][y-1]== rockford_dead;
                    tab[x-1][y-1]== case_vide;
                }
                tab[x][y-1]== case_position;
                tab[x][y]== case_vide;
            break;

            case case_rocher:
                if(tab[x][y-2]== case_libre){
                    tab[x][y-2]== case_rocher;
                    tab[x][y-1]== case_position;
                    tab[x][y]== case_vide;
                }
              
            break;
            case case_diamond:
                    tab[x][y-1]== case_position;
                    tab[x][y]== case_vide;
                    compteur_diamond ++;
            break;
            case case_mur:
            break;
            case case_vide:
                tab[x][y-1]== case_position;
                tab[x][y]== case_vide;
            break;
            
            default:
                console.log('IMPOSSIBLE MOUVEMENT')
        } 
        affichagegrille();
    }

    else if(a.keyCode == KEY_S){
        switch(tab[x+1][y]){
            case case_terre:
            break;

            case case_rocher:
            break;
            case case_diamond:
                    tab[x+1][y]== case_position;
                    tab[x][y]== case_vide;
                    compteur_diamond ++;
            break;

            case case_mur:
            break;

            case case_vide:
                tab[x+1][y]== case_position;
                tab[x][y]== case_vide;
            break;
            
            default:
                console.log('IMPOSSIBLE MOUVEMENT')
        } 
        affichagegrille();
    }
    else if(a.keyCode == KEY_D){
        switch(tab[x][y+1]){

        case case_terre:
            tab[x][y+1]== case_position;
            tab[x][y]== case_vide;
        break;

        case case_rocher:
            if(tab[x][y+2]== case_libre){
                tab[x][y+2]== case_rocher;
                tab[x][y+1]== case_position;
                tab[x][y]== case_vide;
            }
        break;

        case case_diamond:
                tab[x][y+1]== case_position;
                tab[x][y]== case_vide;
                compteur_diamond ++;
        break;

        case case_mur:
        break;

        case case_vide:
            tab[x][y+1]== case_position;
            tab[x][y]== case_vide;
        break;
        
        default:
            console.log('IMPOSSIBLE MOUVEMENT')
        } 
        affichagegrille();
    }

}


//Appel des fonctions
tableau();
document.body.addEventListener('keydown', toucheclavierdown);
