<?php

use yii\helpers\Url;
use yii\helpers\Html;


/* @var $this yii\web\View */

?>
<div class="main-container inner-page">
    <div class="container">
        <div class="row clearfix">
            <h1 class="text-center title-1"> Page Title </h1>
            <hr class="mx-auto small text-hr">

            <div style="clear:both">
                <hr>
            </div>
            <div class="col-xl-12">
                <div class="white-box text-center" style="min-height: 400px">
                    <p>Content Goes Here</p>
                    <div class="row">
                        <div class="col-md-6">
                            <?php echo $this->render('_weather_small'); ?>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
