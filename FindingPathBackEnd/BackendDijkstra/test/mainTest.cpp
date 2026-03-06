#include <vector>
#include <limits>
#include <cstdlib>
#include <emscripten.h>

using namespace std;

extern "C" {

EMSCRIPTEN_KEEPALIVE
int* dijkstra(
    int n,
    int* matrix,
    int start,
    int end
) {
    const int INF = numeric_limits<int>::max();

    vector<int> dist(n, INF);
    vector<bool> visited(n, false);
    vector<int> prev(n, -1);

    dist[start] = 0;

    for (int i = 0; i < n; i++) {
        int u = -1;
        for (int j = 0; j < n; j++) {
            if (!visited[j] && (u == -1 || dist[j] < dist[u])) {
                u = j;
            }
        }

        if (u == -1) break;
        visited[u] = true;

        for (int v = 0; v < n; v++) {
            int w = matrix[u * n + v];
            if (w > 0 && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                prev[v] = u;
            }
        }
    }

    // reconstruire le chemin
    vector<int> path;
    for (int at = end; at != -1; at = prev[at]) {
        path.push_back(at);
    }

    
    int size = path.size();
    int* result = (int*)malloc((size + 1) * sizeof(int));

    result[0] = size;
    for (int i = 0; i < size; i++) {
        result[i + 1] = path[size - 1 - i];
    }

    return result;
}

}
