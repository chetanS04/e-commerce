<?php

namespace App\Http\Controllers;

use App\Models\Themes;
use Illuminate\Http\Request;

class ThemesController extends Controller
{
    public function index()
    {
        $themes = Themes::all();
        return response()->json($themes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'background_color' => 'required|string|max:7',
            'text_color' => 'required|string|max:7',
            'primary_color' => 'required|string|max:7',
            'gradient_start' => 'nullable|string|max:7',
            'gradient_end' => 'nullable|string|max:7',
            'gradient_direction' => 'required|string|max:20',
            'status' => 'boolean',
        ]);

        $validated["status"] = $request->boolean('status', false);

        $theme = Themes::create($validated);

        return response()->json([
            'message' => 'Theme created successfully!',
            'theme' => $theme,
        ], 201);
    }

    public function show($id)
    {
        $theme = Themes::find($id);

        if (!$theme) {
            return response()->json(['message' => 'Theme not found!'], 404);
        }

        return response()->json($theme);
    }

    public function update(Request $request, $id)
    {
        $theme = Themes::find($id);

        if (!$theme) {
            return response()->json(['message' => 'Theme not found!'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'background_color' => 'sometimes|required|string|max:7',
            'text_color' => 'sometimes|required|string|max:7',
            'primary_color' => 'sometimes|required|string|max:7',
            'gradient_start' => 'nullable|string|max:7',
            'gradient_end' => 'nullable|string|max:7',
            'gradient_direction' => 'sometimes|required|string|max:20',
            'status' => 'boolean',
        ]);

        $theme->update($validated);

        return response()->json([
            'message' => 'Theme updated successfully!',
            'theme' => $theme,
        ]);
    }

    public function destroy($id)
    {
        $theme = Themes::find($id);

        if (!$theme) {
            return response()->json(['message' => 'Theme not found!'], 404);
        }

        $theme->delete();

        return response()->json(['message' => 'Theme deleted successfully!']);
    }
}
