<?php

use frontend\assets\AdsAsset;
use yii\helpers\Url;

/**
 * @var $this  \yii\web\View
 * @var $model \common\models\Page
 */
$this->title = 'Tải lên hồ sơ việc làm';
$bundle = AdsAsset::register($this);
?>
<div class="intro-inner">
    <div class="about-intro" style="
            background:url(<?php echo $this->assetManager->getAssetUrl($bundle, 'images/bg2.jpg') ?>) no-repeat center;
            background-size:cover;">
        <div class="dtable hw100">
            <div class="dtable-cell hw100">
                <div class="container text-center">
                    <h1 class="intro-title animated fadeInDown"> Job </h1>
                </div>
            </div>
        </div>
    </div>
    <!--/.about-intro -->

</div>
<!-- /.intro-inner -->

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
                </div>
            </div>


        </div>
    </div>
</div>
<!-- /.main-container -->
