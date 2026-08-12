import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import{fetchMovieById} from '../../../api/movieapi';
import {logwatch} from '../../../api/watchapi';
import type{ Movie } from '../../../type/movie.type';
import SimilarMovies from "./components/similarMovies";


export  default function Moviedetail() {
    const {id}=useParams<{id:string}>();
    const [movie,setmovie]=useState<Movie | null>(null);
    useEffect(()=>{
        if(!id) return ;
        fetchMovieById(parseInt(id)).then((data)=>{
            setmovie(data.movie);
            logwatch({movieid:data.movie.id});

        })
        
    },[id]);
  return (
    <div>
        <h1 className="text-2xl font-semibold mb-4">{movie?.title}</h1>
        {movie?.trailerKey && (
        <iframe
          className="w-full aspect-video rounded mb-4"
          src={`https://www.youtube.com/embed/${movie.trailerKey}`}
          title={`${movie.title} trailer`}
          allowFullScreen
        />
      )}

      <p className="text-gray-700 mb-2">{movie?.description}</p>
      <p className="text-sm text-gray-500">
        {movie?.releaseYear} · {movie?.durationMinutes} min · ⭐ {movie?.averageRating.toFixed(1)} (
        {movie?.ratingCount} ratings)
      </p>
      <div className="flex gap-2 mt-3">
        {movie?.genres.map((g) => (
          <span key={g.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {g.name}
          </span>
        ))}
      </div>
      {movie&&<SimilarMovies movieId={movie.id} />}
    </div>
  );

    
  
}
