#include "../Header/Conjunto.h"
#include <fstream>
#include <iostream>

Conjunto::Conjunto(const string& ruta_intentos, const string& ruta_respuestas) {
    intentos_validos = cargarFichero(ruta_intentos);
    respuestas_posibles = cargarFichero(ruta_respuestas);
}

vector<string> Conjunto::cargarFichero(const string& ruta) {
    vector<string> palabras;
    ifstream archivo(ruta);

    if (!archivo.is_open()) {
        cerr << "Error: no se pudo abrir el archivo -> " << ruta << endl;
    } else {
        string linea;
        while (getline(archivo, linea)) {
            if (!linea.empty()) {
                if (linea.back() == '\r') {
                    linea.pop_back();
                }

                palabras.push_back(linea);
            }
        }
    }

    return palabras;
}

const vector<string>& Conjunto::get_intentos_validos() const {
    return intentos_validos;
}

const vector<string>& Conjunto::get_respuestas_validas() const {
    return respuestas_posibles;
}