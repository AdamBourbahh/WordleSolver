#include "Entropia.h"
#include <cmath>
#include <utility>

using namespace std;

float Entropia::CalcularEntropia(
    const string& candidato,
    const vector<string>& soluciones
) {
    int informacion[243]{0};

    // Cuenta cuantos candidatos producen cada patron de colores.
    for (const string& solucion : soluciones) {
        int patron = Logica::evaluar_intento(candidato, solucion);
        ++informacion[patron];
    }

    float entropia = 0;
    int total_soluciones = soluciones.size();

    for (int patron = 0; patron < 243; ++patron) {
        if (informacion[patron] > 0) {
            float probabilidad = static_cast<float>(informacion[patron])
                / total_soluciones;
            entropia += probabilidad * log2(1 / probabilidad);
        }
    }

    return entropia;
}

string Entropia::CalcularMejorGuess(
    const vector<string>& candidatos,
    const vector<string>& soluciones
) {
    if (soluciones.empty() || candidatos.empty()) {
        return "";
    }

    // Si solo queda una solucion, no hace falta calcular entropia.
    if (soluciones.size() == 1) {
        return soluciones[0];
    }

    Guess mejor_guess = {candidatos[0], 0};

    for (const string& candidato : candidatos) {
        float entropia = CalcularEntropia(candidato, soluciones);

        if (entropia > mejor_guess.entropia) {
            mejor_guess.entropia = entropia;
            mejor_guess.palabra = candidato;
        }
    }

    return mejor_guess.palabra;
}

void Entropia::FiltrarSoluciones(
    vector<string>& soluciones,
    const int patron,
    const string& palabra
) {
    auto es_distinta = [&](const string& candidata) {
        return patron != Logica::evaluar_intento(palabra, candidata);
    };

    erase_if(soluciones, es_distinta);
}
