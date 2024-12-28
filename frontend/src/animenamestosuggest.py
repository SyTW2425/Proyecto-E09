import requests

def fetch_all_anime_names(api_url, output_file):
    anime_names = []  # List to store anime names
    current_url = api_url

    while current_url:
        try:
            # Make a GET request to the API
            response = requests.get(current_url)
            response.raise_for_status()  # Raise an exception for 4xx/5xx status codes
            data = response.json()

            # Get the names of the anime from the data
            for anime in data.get("anime", []):
                anime_names.append(anime.get("name"))

            # Get the URL of the next page
            current_url = data.get("links", {}).get("next")

        except requests.exceptions.RequestException as e:
            print(f"Error al obtener datos: {e}")
            break

    # Store the anime names in a file .txt
    try:
        with open(output_file, "w", encoding="utf-8") as file:
            for name in anime_names:
                file.write(name + "\n")
        print(f"Se guardaron {len(anime_names)} nombres en '{output_file}'.")
    except IOError as e:
        print(f"Error al guardar el archivo: {e}")

# Starter URL and output file
api_url = "https://api.animethemes.moe/anime?fields%5Banime%5D=name&page%5Bsize%5D=100&page%5Bnumber%5D=1"
output_file = "anime_names.txt"

fetch_all_anime_names(api_url, output_file)