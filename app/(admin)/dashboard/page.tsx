"use client";
import React from 'react'
import ProductTable from '@/components/admin/ProductTable';
const page = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <ProductTable />
      </div>
    </div>
  )
}


export default page
