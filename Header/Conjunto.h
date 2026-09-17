#pragma once
#include <string>
#include <vector>

using namespace std;

class Conjunto {
    private:
    vector<string> intentos_validos;
    vector<string> respuestas_posibles;

    vector<string> cargarFichero(const string& ruta);
    public:
    Conjunto(const string& ruta_intentos, const string& ruta_respuestas);

    const vector<string>& get_intentos_validos() const;
    const vector<string>& get_respuestas_validas() const;
};