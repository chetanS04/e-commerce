<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Themes extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'background_color',
        'text_color',
        'primary_color',
        'gradient_start',
        'gradient_end',
        'gradient_direction',
        'status',
    ];
}
