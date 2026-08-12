import {useState, useEffect} from 'react';
import { fetchmovies } from '../../../api/movieapi';
import type{ Movie,Pagination } from '../../../type/movie.type';
import {  Link, useNavigate } from 'react-router-dom';

 
 export const movielist = () => {
    const navigate= useNavigate();
    const [movies,setmovies]=useState<Movie[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [search,setsearch]=useState("");
    const [page,setPage]=useState(1);
    const [loading,setloading]=useState(false);
    const [error,seterror]=useState<string | null>(null);

    useEffect(()=>{
        setloading(true);
        seterror(null);
        fetchmovies({page,search}).then((data)=>{
            setmovies(data.movies);
            setPagination(data.pagination);
            setloading(false);
        }).catch((err)=>{
            seterror(err.message);
            
        }).finally(()=>{
            setloading(false);
        });
    }, [page,search]);

   return (
         <div className="p-6"
          >
            <input
            value={search}
            onChange={(e) => setsearch(e.target.value)}
            placeholder="Search movies..."
              className="border rounded px-3 py-2 mb-6 w-full max-w-sm"

            />
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movies.map((movie) => (
                  <Link key={movie.id} to={`/movies/${movie.id}`}>
                   
                    {movie.posterUrl && (
              <img src={movie.posterUrl} alt={movie.title} className="rounded w-full" />
            )}

                        <h3 className="text-lg font-bold">{movie.title}</h3>
                        <p className="text-gray-600">{movie.releaseYear}</p>
                      
                    
                  </Link>


                ))}
                



            </div>
            {pagination && (
        <div className="flex gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

            </div>

   )
 }
 