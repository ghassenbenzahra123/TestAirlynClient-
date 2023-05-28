import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SetCurrentSong, SetCurrentSongIndex, SetSelectedPlaylist } from '../redux/userSlice';
import Papa from 'papaparse';

function SongsList() {
  const { currentSong, selectedPlaylist, allSongs } = useSelector((state) => state.user);
  const [songsToPlay, setSongsToPlay] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPlaylist) {
      if (selectedPlaylist && selectedPlaylist.name === 'All Songs' && searchKey !== '') {
        const tempSongs = [];

        selectedPlaylist.songs.forEach((song) => {
          if (JSON.stringify(song).toLowerCase().includes(searchKey)) {
            tempSongs.push(song);
          }
        });
        setSongsToPlay(tempSongs);
      } else {
        setSongsToPlay(selectedPlaylist?.songs);
      }
      setCurrentPage(1); // Reset current page when the selected playlist changes
    }
  }, [selectedPlaylist, searchKey]);

  const exportToCSV = () => {
    const csv = Papa.unparse(songsToPlay);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'songsToPlay.csv');
    tempLink.click();
  };

  const SONGS_PER_PAGE = 4;

  return (
    <div className="flex flex-col gap-3">
      <div className="pl-3 pr-6">
        <input
          type="text"
          placeholder="Song, Artist, Album"
          className="rounded w-full"
          onFocus={() =>
            dispatch(
              SetSelectedPlaylist({
                name: 'All Songs',
                songs: allSongs,
              })
            )
          }
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </div>
      <button onClick={exportToCSV}>Export to CSV</button>

      <div >
        {songsToPlay
          .slice((currentPage - 1) * SONGS_PER_PAGE, currentPage * SONGS_PER_PAGE)
          .map((song, index) => {
            const isPlaying = currentSong?._id === song._id;
            return (
              <div
                className={`p-2 text-gray-600 flex items-center justify-between cursor-pointer ${isPlaying && 'shadow rounded text-active font-semibold border-active border-2'
                  }`}
                onClick={() => {
                  dispatch(SetCurrentSong(song));
                  dispatch(SetCurrentSongIndex(index));
                }}
              >
                <div>
                  <h1>{song.title}</h1>
                  <h1>
                    {song.artist} {song.album} {song.year}
                  </h1>
                </div>
                <div>
                  <h1>{song.duration}</h1>
                </div>
              </div>
            );
          })}
        {songsToPlay.length > 4 ?
          <div className="p-2 text-gray-600 flex items-center justify-between cursor-pointer">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              disabled={
                currentPage === Math.ceil(songsToPlay.length / SONGS_PER_PAGE) ||
                selectedPlaylist?.songs.length === 0
              }
              onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
            >
              Next
            </button>
          </div> : <></>}
      </div>


    </div>
  );
}

export default SongsList;
