/**
 * CategoriesManager.tsx - Component for managing categories
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider
} from '@mui/material';
import { CostsDB, Category, CostItem, Currency } from '../../types/index';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';

interface CategoriesManagerProps {
  db: CostsDB | null;
}

/**
 * CategoriesManager component
 */
export default function CategoriesManager({ db }: CategoriesManagerProps): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryColor, setCategoryColor] = useState<string>('#6366f1');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryDetailsOpen, setCategoryDetailsOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryCosts, setCategoryCosts] = useState<CostItem[]>([]);
  const [categoryTotal, setCategoryTotal] = useState<Record<Currency, number>>({
    USD: 0,
    ILS: 0,
    GBP: 0,
    EURO: 0
  });

  useEffect(function() {
    if (db) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  const loadCategories = async function(): Promise<void> {
    if (!db) return;
    
    try {
      setLoading(true);
      const cats = await db.getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = function(category?: Category): void {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryColor(category.color || '#6366f1');
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryColor('#6366f1');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = function(): void {
    setOpenDialog(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryColor('#6366f1');
  };

  const handleSave = async function(): Promise<void> {
    if (!db || !categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        await db.updateCategory(editingCategory.id!, { name: categoryName.trim(), color: categoryColor });
        toast.success('Category updated successfully');
      } else {
        await db.addCategory({ name: categoryName.trim(), color: categoryColor });
        toast.success('Category added successfully');
      }
      handleCloseDialog();
      loadCategories();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteClick = function(category: Category): void {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async function(): Promise<void> {
    if (!db || !categoryToDelete) return;

    try {
      await db.deleteCategory(categoryToDelete.id!);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleCategoryClick = async function(categoryName: string): Promise<void> {
    if (!db) {
      toast.error('Database not initialized');
      return;
    }

    try {
      setSelectedCategory(categoryName);
      setCategoryDetailsOpen(true);
      
      // Load costs for this category
      const costs = await db.getCostsByCategory(categoryName);
      setCategoryCosts(costs);

      // Calculate totals by currency
      const totals: Record<Currency, number> = {
        USD: 0,
        ILS: 0,
        GBP: 0,
        EURO: 0
      };

      costs.forEach(function(cost) {
        totals[cost.currency] += cost.sum;
      });

      setCategoryTotal(totals);
    } catch (error) {
      toast.error('Failed to load category details');
      console.error(error);
    }
  };

  const handleCloseCategoryDetails = function(): void {
    setCategoryDetailsOpen(false);
    setSelectedCategory('');
    setCategoryCosts([]);
    setCategoryTotal({
      USD: 0,
      ILS: 0,
      GBP: 0,
      EURO: 0
    });
  };

  if (!db) {
    return (
      <Alert severity="info">
        Database not initialized
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Categories Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          }}
        >
          Add Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
          <Typography variant="body1" color="text.secondary">
            No categories yet. Add your first category!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: 2, 
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: category.color || '#6366f1',
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(category)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(category)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Color"
              type="color"
              value={categoryColor}
              onChange={(e) => setCategoryColor(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCategory ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Details Dialog */}
      <Dialog 
        open={categoryDetailsOpen} 
        onClose={handleCloseCategoryDetails} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {selectedCategory} - Expenses
            </Typography>
            <IconButton onClick={handleCloseCategoryDetails} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {categoryCosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No expenses found for this category
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Totals by Currency */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Total by Currency
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(categoryTotal).map(([currency, total]) => {
                    if (total > 0) {
                      return (
                        <Grid item xs={6} sm={3} key={currency}>
                          <Paper 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {currency}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {total.toFixed(2)}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    }
                    return null;
                  })}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Expenses List */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                All Expenses ({categoryCosts.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Currency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>
                          {cost.date.year}-{cost.date.month.toString().padStart(2, '0')}-{cost.date.day.toString().padStart(2, '0')}
                        </TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {cost.sum.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip label={cost.currency} size="small" color="primary" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

