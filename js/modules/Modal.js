import { events } from './Events'
import { props } from './Props'

export default class Modal{

    constructor(element){
        this.element = $(element)
        this.tree = this.element.find('.shortcode-tree')
        this.fields = this.element.find('.fields')
        this.argument = '.argument'
        this.shortcode = null
        this.options = {
            minWidth: 600,
            minHeight: 600,
            closeOnEscape: true,
            dialogClass: "block-modal-window",
            buttons: [
                {
                    text: wp.strings.save,
                    click: () => this.save()
                },
                {
                    text: wp.strings.cancel,
                    click: () => this.close()
                }
            ]
        }
    }

    save(){
        this.close()

        let shortcodeFields = this.fields.find(this.argument)
        let shortcode = this.shortcode
        let shortcodeArgs = {}

        $.each(shortcodeFields, function(){
            let field = $(this)
            let name = field.attr('name')
            let value = (field.val()) ? field.val() : null

            if(value != '') shortcodeArgs[name] = value
        })

        if(this.fields.find('#'+wp.playground.mce).length){
            const blockContentArgs = {
                id: this.id,
                group: 'content',
                value: tinymce.editors[wp.playground.mce].getContent()
            }

            props.saveProp(blockContentArgs)
        }

        // save shortcode args

        const blockShortcodeArgs = {
            id: this.id,
            group: 'shortcodeArgs',
            value: shortcodeArgs
        }

        props.saveProp(blockShortcodeArgs)

    }

    open(id){
        this.element.dialog(this.options)
        this.id = id

        const blockProps = props.getProps(this.id)
        const shortcode = (blockProps) ? blockProps.shortcode : false

        if(shortcode){
            // if id has props - empty the fields, call edit on that shortcode
            this.empty()
            this.edit(shortcode, blockProps.shortcodeArgs, blockProps.content)
        }else{
            // if it doesnt - empty the fields and show the tree.
            this.empty()
            this.showTree()
        }

    }

    // called when clicked on one of the tree items (shortcodes)
    addShortcode(shortcode){
        const args = {
            id: this.id,
            group: 'shortcode',
            value: shortcode
        }

        props.saveProp(args)
        events.emit('shortcode-selected', this.id)
        this.edit(shortcode)
    }

    edit(shortcode, args, content){
        this.shortcode = shortcode
        this.hideTree()
        $.get({
            url: wp.ajax_url,
            data: {
                action: 'get_shortcode',
                type: shortcode,
                args: args,
                content: content
            },
            success: response => this.fields.append(response)
        })
    }

    close(){
        this.element.dialog('close')
    }

    empty(){
        this.fields.empty()
    }

    hideTree(){
        this.tree.hide()
        this.element.parent().addClass('buttons-active')
    }

    showTree(){
        this.tree.show()
        this.element.parent().removeClass('buttons-active')
    }

}
