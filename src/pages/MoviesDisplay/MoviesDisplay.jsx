import React, { useEffect, useState } from "react";
import MovieForm from "../../components/MovieForm/MovieForm";
import Error from "../../components/ErrorComponent/Error";
import {
  deleteMovie,
  getMovieById,
  getMoviesData,
  postMoviesData,
  updateMoviesData,
} from "../../services/axiosData";
import { useStyles } from "../MoviesDisplay/MoviesDisplay.style";
import MoviesList from "../../components/MoviesList/MoviesList";
import DialogPopup from "../../components/Dialog/DialogPopup";

function MoviesDisplay(props) {
  const {
    open,
    setOpen,
    openHandleClick,
    errors,
    setErrors,
    allMovies,
    resetForm,
    setAllMovies,
  } = props;
  // console.log("All movies in moviesDisplay", allMovies);

  const [moviesData, setMoviesData] = useState("");

  const [id, setId] = useState("");
  const [btnText, setBtnText] = useState(false);

  const [statusCode, setStatusCode] = useState();
  const classes = useStyles();

  useEffect(() => {
    (async function () {
      try {
        const responseMovie = await getMoviesData();

        setMoviesData(responseMovie);
      } catch (error) {
        console.log(error);
        // console.log("status", error.response.data.message,);
        // console.log("status", error.response.status);
        setStatusCode(error.response.status);
      }
    })();
  }, []);

  const update = async (id) => {
    try {
      const responseMovie = await getMovieById(id);
      setAllMovies(responseMovie);
    } catch (error) {
      console.log(error);
    }
  };

  //====================== VALIDATION OF INPUT FIELDS ========================
  const validate = (fieldValues = allMovies) => {
    console.log("Inputs Resposnse:", allMovies);

    let validation = { ...errors }; // specifies that to exists all other error messages if we type in another input

    if ("movieTitle" in fieldValues) {
      validation.movieTitle = fieldValues.movieTitle
        ? fieldValues.movieTitle.length < 3
          ? "Must be 3 characters!"
          : ""
        : "This field is required";
    }

    if ("movieGenre" in fieldValues) {
      validation.movieGenre = fieldValues.movieGenre
        ? fieldValues.movieGenre.length < 3
          ? "Must be 3 characters!"
          : ""
        : "This field is required";
    }
    if ("movieCast" in fieldValues) {
      validation.movieCast = fieldValues.movieCast
        ? fieldValues.movieCast.length < 4
          ? "Must be 3 characters!"
          : ""
        : "This field is required";
    }
    if ("movieIMDBRating" in fieldValues) {
      validation.movieIMDBRating = fieldValues.movieIMDBRating
        ? fieldValues.movieIMDBRating > 5
          ? "Must be at max 5 star rating!"
          : ""
        : "This field is required";
    }
    setErrors({
      ...validation,
    });

    const returendValue = Object.values(validation).every(
      (vali) => vali === ""
    ); // returns either true or false
    return returendValue;
  };

  //=======================  HANDLE INPUT VALUES =============================
  const handleInputChange = (event) => {
    console.log("In handle Input Change");
    const key = event.target.name;
    const value = event.target.value;

    setAllMovies((inputs) => ({
      ...inputs,
      [key]: value,
    }));
    validate({ [key]: value });
  };

  //====================== HANDLE SUBMIT ========================
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("In handleSubmit");

    let movieDetails = {
      movieTitle: allMovies.movieTitle,
      movieGenre: allMovies.movieGenre,
      movieCast: allMovies.movieCast,
      movieIMDBRating: allMovies.movieIMDBRating,
    };

    if (validate()) {
      if (id) {
        try {
          setBtnText(!btnText);
          const res = await updateMoviesData(movieDetails, id);
          const getmovies = await getMoviesData();
          setMoviesData(getmovies);
          setId("");
          resetForm();
        } catch (err) {
          console.log("POST ERROR", err);
        }
      } else {
        try {
          console.log("In post");
          const res = await postMoviesData(movieDetails);
          const getmovies = await getMoviesData();
          setMoviesData(getmovies);
          resetForm();
        } catch (err) {
          console.log("POST ERROR", err);
        }
      }
      handleClose();
    }
  };

  //  ========================= DELETE MOVIE FUNCTION ================
  const handleDelete = async (movieId) => {
    console.log("In Handle Delete ID", movieId);
    try {
      const responseMovie = await deleteMovie(movieId);
      const getmovies = await getMoviesData();
      console.log("Get movies response", getmovies);
      setMoviesData(getmovies);
    } catch (error) {
      console.log(error);
    }
  };

  // =======================   HANDLE CLOSE DIALOG ===================
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // ========================  POPULATE DATA BEFORE UPDATING ============
  const updateData = async (id) => {
    console.log("Id for UPDATE in MOVIESDISPLAY", id);
    setId(id);
    update(id);
  };

  return (statusCode === 400) ? (
    <Error />
  ) : (
    <>
      <div>
        <DialogPopup
          openPopup={open}
          onclose={handleClose}
          classname={classes.dialogBox}
          title="Movie App"
        >
          <MovieForm
            onchange={handleInputChange}
            onsubmit={handleSubmit}
            moviesdata={allMovies}
            inputErrors={errors}
            onbtnText={btnText}
          />
        </DialogPopup>

        <MoviesList
          movies={moviesData}
          ondelete={handleDelete}
          openDialog={openHandleClick}
          onUpdate={updateData}
        />
      </div>
    </>
  );
}

export default MoviesDisplay;
