#pragma once
#include <vector>
#include "Logica.h"
using namespace std;



class Entropia {
    
    static float CalcularEntropia(const string& candidato, const vector<string>& solucion);

    public:
    struct Guess{
        string palabra={""};
        double entropia=0.0;
    };

    static string CalcularMejorGuess(const vector<string>& candidatos, const vector<string>& soluciones);

    static void FiltrarSoluciones(vector<string>& soluciones, const int patron, const string& palabra);
};