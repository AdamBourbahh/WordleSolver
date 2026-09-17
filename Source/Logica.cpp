#include "Logica.h"

using namespace std;

int Logica::evaluar_intento(
    const string& candidato,
    const string& solucion
) {
    int colores[5]{0};
    int conteo_amarillas[26]{0};
    int potencia = 1;
    int patron = 0;

    // Primero se marcan las letras verdes y se cuentan las restantes.
    for (int posicion = 0; posicion < 5; ++posicion) {
        if (candidato[posicion] == solucion[posicion]) {
            colores[posicion] = 2;
        } else {
            ++conteo_amarillas[solucion[posicion] - 'a'];
        }
    }

    // Despues se marcan como amarillas las letras restantes que coincidan.
    for (int posicion = 0; posicion < 5; ++posicion) {
        if (colores[posicion] == 2) {
            continue;
        }

        int letra = candidato[posicion] - 'a';
        if (conteo_amarillas[letra] > 0) {
            colores[posicion] = 1;
            --conteo_amarillas[letra];
        }
    }

    // Convierte los cinco colores en un numero en base 3.
    for (int color : colores) {
        patron += potencia * color;
        potencia *= 3;
    }

    return patron;
}

int Logica::codificar_intento(const string& candidato) {
    int patron = 0;
    int potencia = 1;

    for (char resultado : candidato) {
        patron += potencia * (resultado - '0');
        potencia *= 3;
    }

    return patron;
}
