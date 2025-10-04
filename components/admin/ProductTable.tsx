"use client";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Plus, Trash } from "lucide-react";
import { DataTable } from "./DataTable";
import { toast } from "sonner";
import { ProductForm, supabase } from "./ProductForm";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useModal } from "@/app/context/ModalContext";

export type Row = {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock_quantity: number;
  remaining_quantity: number;
  category_id: string;
  colors: { name: string; code: string; }[];
  sizes: string[];
  main_image_url: string;
  is_Trendy: boolean;
};



export default function ProductTable() {
  const { closeModal } = useModal();
  const PAGE_SIZE = 10;
  const [rows, setRows] = React.useState<Row[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<
    { id: string; name: string }[]
  >([]);
  const [editingProduct, setEditingProduct] = React.useState<Row | null>(null);
  const [sorting, setSorting] = React.useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'updated_at',
    direction: 'desc'
  });

  async function fetchPage(p: number) {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    closeModal();
    // Fetch products from Supabase
    const { data, count, error } = await supabase
      .from("products")
      .select("*", {
        count: "exact",
      })
      .range(from, to)
      .order(sorting.column, { ascending: sorting.direction === 'asc' });

    if (!error) {
      setRows(data as unknown as Row[]);
      setPage(p);
      setPageCount(Math.ceil((count ?? 0) / PAGE_SIZE));
    }
    setLoading(false);
  }
  const columns: ColumnDef<Row>[] = [
  { 
    accessorKey: "name", 
    header: "Name",
    enableSorting: true,
  },
  {
    accessorKey: "price",
    header: "Price",
    enableSorting: true,
    cell: ({ getValue }) => `₹ ${getValue<number>().toFixed(2)}`,
  },
  { 
    accessorKey: "discount", 
    header: "Disc %",
    enableSorting: true,
  },
  { 
    accessorKey: "stock_quantity", 
    header: "Stock",
    enableSorting: true,
  },
  { 
    accessorKey: "remaining_quantity", 
    header: "Remaining",
    enableSorting: true,
  },
  { 
    accessorKey: "updated_at", 
    header: "Last Updated",
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  { 
    accessorKey: "category_id", 
    header: "Category",
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                const productToEdit = rows.find(row => row.id === product.id);
                if (productToEdit) {
                  setEditingProduct(productToEdit);
                  setDialogOpen(true);
                }
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </DialogDescription>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from("products")
                        .delete()
                        .eq("id", product.id);
                      
                      if (error) throw error;
                      
                      toast.success("Product deleted successfully");
                      fetchPage(page);
                    } catch (error) {
                      toast.error("Failed to delete product");
                      console.error("Delete error:", error);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
  async function fetchCategories() {
    let { data: categories, error } = await supabase
      .from("categories")
      .select("id,name");
    setCategories(categories || []);
    if (error) {
      console.error("Error fetching categories:", error);
    }
  }
  React.useEffect(() => {
    fetchPage(0);
    fetchCategories();
  }, []);

  return (
    <div className="space-y-4">
      {/* Create product dialog */}
      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
          }
        }}
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Products</h2>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={rows}
          pageCount={pageCount}
          currentPage={page}
          onPageChange={fetchPage}
          isLoading={loading}
        />

        {/* Modal content re‑uses ProductForm */}
        <DialogContent className="max-w-2xl">
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add Product'}
            <ScrollArea className="h-150 w-full rounded-md border-none">
              <ProductForm
                product={editingProduct}
                onSaved={() => {
                  fetchPage(page);
                  setEditingProduct(null);
                  setDialogOpen(false);
                }}
                categories={categories}
              />
            </ScrollArea>
          </DialogTitle>
        </DialogContent>
      </Dialog>
    </div>
  );
}
