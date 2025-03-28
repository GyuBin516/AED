const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(35.8655753, 128.59339),
    level: 3
};
const map = new kakao.maps.Map(mapContainer, mapOption);
const $modal = document.getElementById('modal');

const geocoder = new kakao.maps.services.Geocoder();
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value;
    console.log("입력한 검색어:", query);

    if (!query) {
        alert("검색어를 입력하세요.");
        return;
    }

    geocoder.addressSearch(query, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
            const Lat = result[0].y;
            const Lon = result[0].x;
            const coords = new kakao.maps.LatLng(Lat, Lon);

            console.log("새로운 좌표:", Lat, Lon);
            map.setCenter(coords);

            fetchAEDData(Lat, Lon);
        } else {
            alert("검색 결과가 없습니다.");
        }
    });
});

const fetchAEDData = (lat, lon) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = new DOMParser().parseFromString(xhr.responseText, 'text/xml');
                console.log(response);

                const items = response.querySelectorAll('response > body > items > item');

                if (!items.length) {
                    alert("AED 정보를 찾을 수 없습니다.");
                    return;
                }

                removeAEDMarkers();

                items.forEach(item => {
                    let wgs84Lat = item.querySelector('wgs84Lat')?.textContent;
                    let wgs84Lon = item.querySelector('wgs84Lon')?.textContent;
                    let org = item.querySelector('org')?.textContent;
                    let address = item.querySelector('buildAddress')?.textContent;
                    let tel = item.querySelector('managerTel')?.textContent;

                    if (!wgs84Lat || !wgs84Lon) return;

                    const markerPosition = new kakao.maps.LatLng(parseFloat(wgs84Lat), parseFloat(wgs84Lon));

                    const marker = new kakao.maps.Marker({
                        position: markerPosition,
                        map: map
                    });

                    aedMarkers.push(marker);

                    kakao.maps.event.addListener(marker, 'click', () => {
                        showAEDInfo(org, address, tel);

                    });
                });
            }
        }
    };
    const url = `http://apis.data.go.kr/B552657/AEDInfoInqireService/getAedLcinfoInqire?serviceKey=8b0aFRZp5USoab0IxfLClNWrx1L1v06Dx8awjJSOU5zfXsl3T9ogvBdgtOB1VRlwJhz6ISVMl%2F5%2BLP651RUXMw%3D%3D&WGS84_LON=${lon}&WGS84_LAT=${lat}&resultType=json&pageNo=1&numOfRows=1000`;
    xhr.open('GET', url);
    xhr.send();
};

fetchAEDData(35.8655753, 128.59339);

let aedMarkers = [];

const removeAEDMarkers = () => {
    aedMarkers.forEach(marker => marker.setMap(null));
    aedMarkers = [];
};

const showAEDInfo = (org, address, tel) => {
    document.getElementById("modalBody").innerHTML = `
        <tr class="tr-td">
            <th class="td-info">${org}</th>
            <th class="td-address">${address}</th>
            <th class="td-tel">${tel}</th>
        </tr>`;
        $modal.classList.add('visible');
};
document.querySelector(".modal-close").addEventListener("click", () => {
    $modal.classList.remove('visible');
});


















