<?php
/**
 * Author: Eugine Terentev <eugine@terentev.net>
 */

namespace backend\widgets;

use trntv\filekit\widget\Upload;
use Yii;
use yii\base\InvalidParamException;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\jui\JuiAsset;
use yii\widgets\InputWidget;

/**
 * Class Upload
 * @package trntv\filekit\widget
 */
class UploadMultiCloud extends Upload
{
    /**
     * @var
     */
    public $fileName = 'file';
    /**
     * @var
     */
    public $files;
    /**
     * @var array|\ArrayObject
     */
    public $url;
    /**
     * @var array
     */
    public $clientOptions = [];
    /**
     * @var bool
     */
    public $showPreviewFilename = false;
    /**
     * @var bool
     */
    public $multiple = false;
    /**
     * @var bool
     */
    public $sortable = false;
    /**
     * @var int min file size in bytes
     */
    public $minFileSize;
    /**
     * @var int
     */
    public $maxNumberOfFiles = 1;
    /**
     * @var int max file size in bytes
     */
    public $maxFileSize;
    /**
     * @var string regexp
     */
    public $acceptFileTypes;
    /**
     * @var string
     */
    public $messagesCategory = 'filekit/widget';
    /**
     * @var bool preview image file or not in the upload box.
     */
    public $previewImage = true;
    /**
     * custom hiddenInput id，if not set $this->options['id'] will be use.
     * useful if use name,value
     * @var null|string
     */
    public $hiddenInputId = null;

    /**
     * @throws \yii\base\InvalidConfigException
     */
    public function init()
    {
        //parent::init();

        $this->registerMessages();

        if ($this->maxNumberOfFiles > 1 || $this->multiple) {
            $this->multiple = true;
        }
        if ($this->hasModel()) {
            $this->name = $this->name ?: Html::getInputName($this->model, $this->attribute);
            $this->value = $this->value ?: Html::getAttributeValue($this->model, $this->attribute);
        }
        if (!array_key_exists('name', $this->clientOptions)) {
            $this->clientOptions['name'] = $this->name;
        }
        if ($this->multiple && $this->value && !is_array($this->value)) {
            throw new InvalidParamException('In "multiple" mode, value must be an array.');
        }
        if (!array_key_exists('fileparam', $this->url)) {
            $this->url['fileparam'] = $this->getFileInputName();
        }
        if (!$this->files && $this->value) {
            $this->files = $this->multiple ? $this->value : [$this->value];
        }

        $this->clientOptions = ArrayHelper::merge(
            [
                //'url' => Url::to($this->url),
                'url' => Url::to('http://localhost:7000/upload-local?type=1&fileparam=' . $this->getFileInputName(), true),
                //'url' => Url::to('https://dropcloudstorage.herokuapp.com/upload-cloud?fileparam=' . $this->getFileInputName(), true),
                'multiple' => $this->multiple,
                'sortable' => $this->sortable,
                'maxNumberOfFiles' => $this->maxNumberOfFiles,
                'maxFileSize' => $this->maxFileSize,
                'minFileSize' => $this->minFileSize,
                'acceptFileTypes' => $this->acceptFileTypes,
                'files' => $this->files,
                'previewImage' => $this->previewImage,
                'showPreviewFilename' => $this->showPreviewFilename,
                'pathAttribute' => 'path',
                'baseUrlAttribute' => 'base_url',
                'pathAttributeName' => 'path',
                'baseUrlAttributeName' => 'base_url',
                'messages' => [
                    'maxNumberOfFiles' => Yii::t($this->messagesCategory, 'Maximum number of files exceeded'),
                    'acceptFileTypes' => Yii::t($this->messagesCategory, 'File type not allowed'),
                    'maxFileSize' => Yii::t($this->messagesCategory, 'File is too large'),
                    'minFileSize' => Yii::t($this->messagesCategory, 'File is too small')
                ]
            ],
            $this->clientOptions
        );
    }

    /**
     * @return void Registers widget translations
     */
    protected function registerMessages()
    {
        if (!array_key_exists($this->messagesCategory, Yii::$app->i18n->translations)) {
            Yii::$app->i18n->translations[$this->messagesCategory] = [
                'class' => 'yii\i18n\PhpMessageSource',
                'sourceLanguage' => 'en-US',
                'basePath' => __DIR__ . '/messages',
                'fileMap' => [
                    $this->messagesCategory => 'filekit/widget.php'
                ],
            ];
        }
    }

    /**
     * @return string
     */
    public function getFileInputName()
    {
        //return sprintf('_fileinput_%s', $this->id);
        return sprintf('file', $this->id);
    }

    /**
     * @return string
     */
    public function run()
    {
        $this->registerClientScript();
        $content = Html::beginTag('div');
        $content .= Html::hiddenInput($this->name, null, [
            'class' => 'empty-value',
            'id' => $this->hiddenInputId === null ? $this->options['id'] : $this->hiddenInputId
        ]);
        $content .= Html::fileInput($this->getFileInputName(), null, [
            'name' => $this->getFileInputName(),
            'id' => $this->getId(),
            'multiple' => $this->multiple
        ]);
        $content .= Html::endTag('div');
        return $content;
    }

}
