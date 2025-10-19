import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import requests


@csrf_exempt
def route_proxy(request):
	"""POST /api/route/ with JSON: { start: {lat,lng}, dest: {lat,lng} }
	Proxies request to GraphHopper Directions API and returns { coords: [[lat,lng], ...] }
	"""
	if request.method != "POST":
		return JsonResponse({"error": "POST required"}, status=405)

	try:
		payload = json.loads(request.body)
		start = payload.get("start")
		dest = payload.get("dest")
		if not start or not dest:
			return JsonResponse({"error": "start and dest required"}, status=400)

		key = settings.GRAPHOPPER_KEY
		if not key:
			return JsonResponse({"error": "GraphHopper key not configured on server"}, status=500)

		# GraphHopper expects lat,lon points in query params (e.g. point=52.5,13.4)
		try:
			s_lat = float(start.get("lat"))
			s_lng = float(start.get("lng"))
			d_lat = float(dest.get("lat"))
			d_lng = float(dest.get("lng"))
		except Exception:
			return JsonResponse({"error": "start and dest must contain numeric lat and lng"}, status=400)

		p1 = f"{s_lat},{s_lng}"
		p2 = f"{d_lat},{d_lng}"
		url = f"https://graphhopper.com/api/1/route?point={p1}&point={p2}&vehicle=foot&points_encoded=false&key={key}"
		r = requests.get(url, timeout=10)
		# If GraphHopper returns non-200, propagate useful info to client
		if r.status_code != 200:
			try:
				return JsonResponse({"error": r.text}, status=502)
			except Exception:
				return JsonResponse({"error": "GraphHopper error"}, status=502)

		data = r.json()
		if not data.get("paths"):
			return JsonResponse({"error": "no path"}, status=400)

		coords = data["paths"][0]["points"]["coordinates"]
		# coords are [lon, lat] - convert to [lat, lon]
		converted = [[c[1], c[0]] for c in coords]
		return JsonResponse({"coords": converted})
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)
