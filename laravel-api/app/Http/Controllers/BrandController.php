<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Exception;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::all();
        return response()->json($brands);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string',
            'description1'  => 'nullable|string',
            'description2'  => 'nullable|string',
            'description3'  => 'nullable|string',
            'image1'        => 'nullable|string|max:255',
            'image2'        => 'nullable|string|max:255',
            'image3'        => 'nullable|string|max:255',
            'status'        => 'required',
        ]);

        $validated['status'] = filter_var($validated['status'], FILTER_VALIDATE_BOOLEAN);

        try {
            $brand = Brand::create($validated);
            return response()->json(['res' => 'success', 'brand' => $brand], 201);
        } catch (Exception $e) {
            return response()->json(['res' => 'error', 'message' => 'Something went wrong.'], 500);
        }
    }

    public function show(Brand $brand)
    {
        return response()->json($brand);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string',
            'description1'  => 'nullable|string',
            'description2'  => 'nullable|string',
            'description3'  => 'nullable|string',
            'image1'        => 'nullable|string|max:255',
            'image2'        => 'nullable|string|max:255',
            'image3'        => 'nullable|string|max:255',
            'status'        => 'required',
        ]);

        $exists = Brand::whereRaw('LOWER(name) = ?', [strtolower($validated['name'])])
            ->where('id', '!=', $brand->id)
            ->exists();

        if ($exists) {
            return response()->json(['res' => 'error', 'message' => 'This brand already exists.'], 422);
        }

        $validated['status'] = filter_var($validated['status'], FILTER_VALIDATE_BOOLEAN);

        try {
            $brand->update($validated);
            return response()->json(['res' => 'success', 'brand' => $brand]);
        } catch (Exception $e) {
            return response()->json(['res' => 'error', 'message' => 'Something went wrong.'], 500);
        }
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return response()->json(['res' => 'success', 'message' => 'Brand deleted successfully']);
    }
}
