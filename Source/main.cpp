#include "Logica.h"
#include <iostream>
#include <string>
#include <vector>
#include "Conjunto.h"
#include "Entropia.h"

using namespace std;

int main() {
    Conjunto conjunto(
        "data/valid-wordle-words.txt",
        "data/wordle-answers-alphabetical.txt"
    );

    vector<string> intentos = conjunto.get_intentos_validos();
    vector<string> candidatos = conjunto.get_respuestas_validas();
    int intentos_realizados = 0;

    // Wordle permite como maximo seis intentos.
    while (intentos_realizados < 6) {
        string palabra = Entropia::CalcularMejorGuess(intentos, candidatos);

        if (palabra.empty()) {
            cout << "No quedan candidatos. Compruebe el patron introducido." << endl;
            break;
        }

        cout << "Pruebe la palabra: " << palabra << endl;
        cout << "Inserte el resultado: 0=gris, 1=amarillo, 2=verde"
             << " (ejemplo: 00210) --> " << endl;

        ++intentos_realizados;

        string resultado;
        cin >> resultado;

        if (resultado == "22222") {
            break;
        }

        Entropia::FiltrarSoluciones(
            candidatos,
            Logica::codificar_intento(resultado),
            palabra
        );
    }
}