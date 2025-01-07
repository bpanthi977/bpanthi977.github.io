import http.server
import socketserver
import random
import time

seq_start = time.time()
seq_n = 0

class RandomDelayHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global seq_start, seq_n
        now = time.time()
        # Random delay between 0 and 0.5 seconds
        delay = random.uniform(0, 0.1)

        if now - seq_start < 1:
            delay = max(1, 12 - seq_n) * delay
            seq_n = seq_n + 1
        else:
            seq_start = now
            seq_n = 0

        time.sleep(delay)

        # Log the request and delay
        print(f"Request to {self.path} - Delay: {delay:.4f} seconds")

        # Proceed with normal file serving
        super().do_GET()

    def do_POST(self):
        # Random delay between 0 and 0.5 seconds
        delay = random.uniform(0, 0.5)
        time.sleep(delay)

        # Log the request and delay
        print(f"POST request to {self.path} - Delay: {delay:.4f} seconds")

        # Proceed with normal handling
        super().do_POST()

def run_server(port=8000):
    with socketserver.TCPServer(("", port), RandomDelayHandler) as httpd:
        print(f"Serving at port {port}")
        print("Each request will have a random delay between 0 and 0.5 seconds")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
