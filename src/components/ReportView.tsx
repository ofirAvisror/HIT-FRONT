/**
 * ReportView.tsx - Component for displaying detailed monthly reports
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Fade
} from '@mui/material';
import { CostsDB, Currency, Report } from '../types/index';
import ExportDialog from './Export/ExportDialog';
import toast from 'react-hot-toast';
// import AssessmentIcon from '@mui/icons-material/Assessment';
// import GetAppIcon from '@mui/icons-material/GetApp';
// import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface ReportViewProps {
  db: CostsDB | null;
}

/**
 * ReportView component
 * Displays a detailed report for a specific month and year in a selected currency
 */
export default function ReportView({ db }: ReportViewProps): JSX.Element {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);

  /**
   * Fetches and displays the report
   */
  const handleGetReport = async function(): Promise<void> {
    if (!db) {
      toast.error('Database not initialized');
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const result = await db.getReport(year, month, currency);
      setReport(result);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to get report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card 
      sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {/* <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} /> */}
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            📊 Monthly Report
          </Typography>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
          inputProps={{ min: 2000, max: 2100 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={month}
            label="Month"
            onChange={(e) => setMonth(e.target.value as number)}
          >
            {monthNames.map((name, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Currency</InputLabel>
          <Select
            value={currency}
            label="Currency"
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="ILS">ILS</MenuItem>
            <MenuItem value="GBP">GBP</MenuItem>
            <MenuItem value="EURO">EURO</MenuItem>
          </Select>
        </FormControl>

            <Button
              variant="contained"
              onClick={handleGetReport}
              disabled={!db || loading}
              // startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GetAppIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Loading...' : 'Get Report'}
            </Button>
          </Box>
        </Paper>

        {report && (
          <Fade in={!!report} timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Report for {monthNames[month - 1]} {year}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip 
                    // icon={<TrendingUpIcon />}
                    label={`${report.costs.length} items`}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => setExportDialogOpen(true)}
                    size="small"
                  >
                    Export
                  </Button>
                </Box>
              </Box>

              {report.costs.length === 0 ? (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No costs found for this month.
                  </Typography>
                </Paper>
              ) : (
                <>
                  <TableContainer 
                    component={Paper}
                    elevation={0}
                    sx={{ 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      mb: 3,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Day</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sum</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Currency</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Category</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.costs.map((cost, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                              '&:hover': { bgcolor: 'action.selected' },
                            }}
                          >
                            <TableCell>
                              <Chip label={cost.Date.day} size="small" color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {cost.sum.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Chip label={cost.currency} size="small" />
                            </TableCell>
                            <TableCell>{cost.category}</TableCell>
                            <TableCell>{cost.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      bgcolor: 'primary.main',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: 4,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Total Amount
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                        {report.total.total.toFixed(2)} {report.total.currency}
                      </Typography>
                    </Box>
                  </Paper>
                </>
              )}
            </Box>
          </Fade>
        )}
      </CardContent>
      
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        db={db}
      />
    </Card>
  );
}

