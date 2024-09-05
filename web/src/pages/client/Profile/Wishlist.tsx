import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useCart } from "../../../contexts";
import { fetchBook, useGetUser, useUpdateWishlist } from "../../../services";
import { Box, Button, Card, CardMedia, Divider, Grid, Link, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import { BookT, GetBookByIdResT } from "../../../types";
import { enqueueSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import { LinkRouter } from "../../../components";

export function Wishlist() {
  const { auth } = useAuth();
  const { addToCartAndUpdateServer } = useCart();
  const queryClient = useQueryClient();
  const { data: userData } = useGetUser(auth?.token as string);
  const updateListMutation = useUpdateWishlist(auth?.token as string);
  const [books, setBooks] = useState<GetBookByIdResT[]>([]);

	const wishlist = useMemo(() => userData?.data?.wishlist || ([] as string[]), [userData]);

  useEffect(() => {
    const fetchBooksInfo = async () => {
      try {
        const bookPromises = wishlist.map(bookId =>
          fetchBook(bookId));
        const bookList: GetBookByIdResT[] = await Promise.all(bookPromises);
        setBooks(bookList);
      } catch (error) {
        console.error("Failed to fetch book info:", error);
      }
    };

    if (wishlist.length > 0) {
      fetchBooksInfo();
    }
  }, [wishlist]);

  //save reference for dragItem and dragOverItem
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);

  const handleSort = async () => {
    //duplicate items
    let _wishlistItems = [...wishlist];

    //remove and save the dragged item content
    const draggedItemContent = _wishlistItems.splice(dragItem.current, 1)[0];

    //switch the position
    _wishlistItems.splice(dragOverItem.current, 0, draggedItemContent);

    //reset the position ref
    dragItem.current = null;
    dragOverItem.current = null;

    // Update the wishlist on the server
    try {
      await updateListMutation.mutateAsync({
        wishlist: _wishlistItems,
      });
    } catch (error) {
      console.error("Failed to update wishlist", error);
    }

		queryClient.invalidateQueries({ queryKey: ['user', auth?.token] });
  }

  const handleRemove = async (book: BookT) => {
    const newWishlist = wishlist.filter(id => id !== book._id);

    // Update the wishlist on the server
    try {
      await updateListMutation.mutateAsync({
        wishlist: newWishlist,
      });

			queryClient.invalidateQueries({ queryKey: ['user', auth?.token] });

      // Update the books array
      const updatedBooks = books.filter(book => book.data._id !== book.data._id);
      setBooks(updatedBooks);

      enqueueSnackbar({
        message: `"${book.title}" removed from wishlist`,
        variant: 'success',
      });
    } catch (error) {
      console.error("Failed to update wishlist", error);
    }
  }

  const handleAddToCart = async (book: BookT) => {
    addToCartAndUpdateServer(book);
    enqueueSnackbar({
      message: `"${book.title}" added to cart`,
      variant: 'success',
    });
  };

  console.log("wishlist", wishlist);
  console.log("books", books);

  return (
    <Box className="list-container" sx={{ p: 2 }}>
      {books.length > 0 ? (
        books.map((item, index) => (
          <Box
            key={item.data._id}
            sx={{ my: 2, cursor: "pointer" }}
            draggable
            onDragStart={() => dragItem.current = index}
            onDragEnter={() => dragOverItem.current = index}
            onDragEnd={handleSort}
          >
            <Card
              variant='outlined'
              sx={{
                maxWidth: 1000,
                height: '100%',
                // backgroundColor: "lightblue",
                display: "flex",
                flexDirection: "row",
                justifyContent: "left",
                alignItems: "center",
                p: 2,
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={1} sx={{ ml: 3 }}>
                  <MenuIcon sx={{ mt: 7 }} />
                  <Typography variant="body2" sx={{ mt: 4, ml: 1 }}>{index + 1}</Typography>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid item xs={2}>
                  <CardMedia
                    component='img'
                    height='160'
                    sx={{ pt: 2, pb: 2, objectFit: 'contain' }}
                    image={`https://covers.openlibrary.org/b/isbn/${item.data.isbn}-M.jpg`}
                    alt={item.data.title}
                  />
                </Grid>
                <Grid item xs={6}>
									<LinkRouter to={`/books/${item.data._id}`}>
                    <Typography variant="h6" sx={{ pt: 2, mb: 1 }}>{item.data.title || "Loading..."}</Typography>
									</LinkRouter>
                  <Typography variant="body2">{item.data.author || "Loading"}</Typography>
                  <Typography variant="h6" sx={{ pt: 2, mb: 1 }}>${item.data.price || "Loading..."}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button variant='contained' fullWidth disabled={!item.data.stock} sx={{ mt: 6 }} onClick={() => handleAddToCart(item.data)}>
                    {!!item.data.stock ? `Add to Cart` : 'Out of Stock'}
                  </Button>
                  <Typography sx={{ display: 'flex', alignItems: 'center', pt: 3, ml: 1 }} onClick={() => handleRemove(item.data)}><DeleteIcon sx={{ mr: 1 }} /><Link color="inherit" variant="body2" >Remove</Link></Typography>
                </Grid>
              </Grid>
            </Card>
          </Box>
        ))
      ) : (
        <Box>No items in wishlist.</Box>
      )}
    </Box>
  );
}
