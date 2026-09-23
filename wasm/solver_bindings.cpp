#include <emscripten/bind.h>
#include <string>
#include <vector>
#include "../Header/Entropia.h"

using namespace emscripten;
using namespace std;

class SolverEngine {
    vector<string> guesses;
    vector<string> solutions;

public:
    SolverEngine(vector<string> valid_guesses, vector<string> possible_solutions)
        : guesses(move(valid_guesses)), solutions(move(possible_solutions)) {}

    void filter(const string& word, int pattern) {
        Entropia::FiltrarSoluciones(solutions, pattern, word);
    }

    string best_guess() const {
        return Entropia::CalcularMejorGuess(guesses, solutions);
    }

    int solution_count() const {
        return static_cast<int>(solutions.size());
    }

    vector<string> current_solutions() const {
        return solutions;
    }
};

EMSCRIPTEN_BINDINGS(wordle_solver) {
    register_vector<string>("StringVector");
    class_<SolverEngine>("SolverEngine")
        .constructor<vector<string>, vector<string>>()
        .function("filter", &SolverEngine::filter)
        .function("best_guess", &SolverEngine::best_guess)
        .function("solution_count", &SolverEngine::solution_count)
        .function("current_solutions", &SolverEngine::current_solutions);
}